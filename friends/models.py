from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import Q

from friends.exceptions import AlreadyFriendsError, AlreadyExistsError
from friends.signals import friendship_request_created, friendship_removed, friendship_request_viewed, \
    friendship_request_canceled, friendship_request_accepted

from accounts.models import User


class NotificationManager(models.Manager):

    def user_unread_notification_count(self, user) -> int:
        if not user:
            return 0
        return self.filter(is_read=False, recipient=user).count()


class FriendshipManager(models.Manager):
    """ Friendship manager """

    def friends(self, user):
        """ Return a list of all friends """
        qs = (
            Friend.objects.select_related("from_user", "to_user")
                .filter(to_user=user)
                .all()
        )
        friends = [u.from_user for u in qs]

        return friends

    def requests(self, user):
        """ Return a list of friendship requests """
        qs = (
            FriendshipRequest.objects.select_related("from_user", "to_user")
                .filter(to_user=user)
                .all()
        )
        requests = list(qs)

        return requests

    def sent_requests(self, user):
        """ Return a list of friendship requests from user """
        qs = (
            FriendshipRequest.objects.select_related("from_user", "to_user")
                .filter(from_user=user)
                .all()
        )
        requests = list(qs)

        return requests

    def got_friend_requests(self, user):
        """ Return a list of friendship requests user got """
        qs = (
            FriendshipRequest.objects.select_related("from_user__profile", "to_user")
                .filter(to_user=user)
                .all()
        )
        unread_requests = list(qs)
        return unread_requests

    def unread_requests(self, user):
        """ Return a list of unread friendship requests """
        qs = (
            FriendshipRequest.objects.select_related("from_user", "to_user")
                .filter(to_user=user, viewed__isnull=True)
                .all()
        )
        unread_requests = list(qs)

        return unread_requests

    def unread_request_count(self, user):
        """ Return a count of unread friendship requests """
        count = FriendshipRequest.objects.select_related("from_user", "to_user").filter(to_user=user,
                                                                                        viewed__isnull=True).count()
        return count

    def read_requests(self, user):
        """ Return a list of read friendship requests """
        qs = (
            FriendshipRequest.objects.select_related("from_user", "to_user")
                .filter(to_user=user, viewed__isnull=False)
                .all()
        )
        read_requests = list(qs)

        return read_requests

    def rejected_requests(self, user):
        """ Return a list of rejected friendship requests """
        qs = (
            FriendshipRequest.objects.select_related("from_user", "to_user")
                .filter(to_user=user, rejected__isnull=False)
                .all()
        )
        rejected_requests = list(qs)

        return rejected_requests

    def unrejected_requests(self, user):
        """ All requests that haven't been rejected """
        qs = (
            FriendshipRequest.objects.select_related("from_user", "to_user")
                .filter(to_user=user, rejected__isnull=True)
                .all()
        )
        unrejected_requests = list(qs)

        return unrejected_requests

    def unrejected_request_count(self, user):
        """ Return a count of unrejected friendship requests """
        count = FriendshipRequest.objects.select_related("from_user", "to_user").filter(to_user=user,
                                                                                        rejected__isnull=True).count()
        return count

    def add_friend(self, from_user, to_user, message=None):
        """ Create a friendship request """
        if from_user == to_user:
            raise ValidationError("Users cannot be friends with themselves")

        if self.are_friends(from_user, to_user):
            raise AlreadyFriendsError("Users are already friends")

        if FriendshipRequest.objects.filter(from_user=from_user, to_user=to_user).exists():
            raise AlreadyExistsError("You already requested friendship from this user.")

        if FriendshipRequest.objects.filter(from_user=to_user, to_user=from_user).exists():
            raise AlreadyExistsError("This user already requested friendship from you.")

        if message is None:
            message = ""

        request, created = FriendshipRequest.objects.get_or_create(
            from_user=from_user, to_user=to_user
        )

        if created is False:
            raise AlreadyExistsError("Friendship already requested")

        if message:
            request.message = message
            request.save()

        friendship_request_created.send(sender=request)

        return request

    def remove_friend(self, from_user, to_user):
        """ Destroy a friendship relationship """
        try:
            qs = Friend.objects.filter(
                Q(to_user=to_user, from_user=from_user) | Q(to_user=from_user, from_user=to_user))
            distinct_qs = qs.distinct().all()

            if distinct_qs:
                friendship_removed.send(
                    sender=distinct_qs[0], from_user=from_user, to_user=to_user
                )
                qs.delete()
                return True
            else:
                return False
        except Friend.DoesNotExist:
            return False

    def are_friends(self, user1, user2):
        """ Are these two users friends? """
        try:
            Friend.objects.get(to_user=user1, from_user=user2)
            return True
        except Friend.DoesNotExist:
            return False


class FriendshipRequest(models.Model):
    """ Model to represent friendship requests """

    from_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="friendship_requests_sent",
    )
    to_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="friendship_requests_received",
    )

    message = models.TextField(_("Message"), blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    rejected = models.DateTimeField(blank=True, null=True)
    viewed = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = _("Friendship Request")
        verbose_name_plural = _("Friendship Requests")
        unique_together = ("from_user", "to_user")

    def __str__(self):
        return f"User #{self.from_user_id} friendship requested #{self.to_user_id}"

    def accept(self):
        """ Accept this friendship request """
        Friend.objects.create(from_user=self.from_user, to_user=self.to_user)
        Friend.objects.create(from_user=self.to_user, to_user=self.from_user)
        friendship_request_accepted.send(
            sender=self, from_user=self.from_user, to_user=self.to_user
        )

        self.delete()

        # Delete any reverse requests
        FriendshipRequest.objects.filter(
            from_user=self.to_user, to_user=self.from_user
        ).delete()

        return True

    def reject(self):
        """ reject this friendship request """
        self.rejected = timezone.now()
        self.save()
        return True

    def cancel(self):
        """ cancel this friendship request """
        self.delete()
        friendship_request_canceled.send(sender=self)
        return True

    def mark_viewed(self):
        self.viewed = timezone.now()
        friendship_request_viewed.send(sender=self)
        self.save()
        return True


class Friend(models.Model):
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friends')
    from_user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now)

    objects = FriendshipManager()

    class Meta:
        verbose_name = _("Friend")
        verbose_name_plural = _("Friends")
        unique_together = ("from_user", "to_user")

    def __str__(self):
        return f"User #{self.to_user_id} is friends with #{self.from_user_id}"

    def save(self, *args, **kwargs):
        # Ensure users can't be friends with themselves
        if self.to_user == self.from_user:
            raise ValidationError("Users cannot be friends with themselves.")
        super().save(*args, **kwargs)


class CustomNotification(models.Model):
    type = models.CharField(default='friend', max_length=30)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=False,
        related_name='notifications',
        on_delete=models.CASCADE
    )
    is_read = models.BooleanField(default=False, blank=False, db_index=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=False,
        on_delete=models.CASCADE
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    obj = GenericForeignKey('content_type', 'object_id')
    url = models.TextField(blank=True, null=True)
    verb = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    deleted = models.BooleanField(default=False, db_index=True)
    emailed = models.BooleanField(default=False, db_index=True)

    objects = NotificationManager()
