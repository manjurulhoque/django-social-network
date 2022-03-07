import json
from django.contrib.auth.mixins import LoginRequiredMixin
from accounts.models import User
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.http import JsonResponse
from django.views.generic import ListView
from django.db.models import Q

from core.contants.common import FRIEND_REQUEST_VERB
from .serializers import NotificationSerializer
from .models import *


class FindFriendsListView(LoginRequiredMixin, ListView):
    model = Friend
    context_object_name = 'users'
    template_name = "friends/find-friends.html"

    def get_queryset(self):
        current_user_friends = self.request.user.friends.values('id')
        sent_request = list(
            FriendshipRequest.objects.filter(Q(to_user=self.request.user) | Q(from_user=self.request.user))
                .values_list('from_user_id', flat=True))
        users = User.objects.exclude(id__in=current_user_friends).exclude(id__in=sent_request).exclude(
            id=self.request.user.id)
        return users


def send_request(request, username=None):
    if username is not None:
        friend_user = User.objects.get(username=username)
        Friend.objects.add_friend(request.user, friend_user, message='Hi! I would like to add you')
        notification = CustomNotification.objects.create(recipient=friend_user, actor=request.user,
                                                         verb=FRIEND_REQUEST_VERB)
        channel_layer = get_channel_layer()
        channel = "notifications_{}".format(friend_user.username)
        async_to_sync(channel_layer.group_send)(
            channel, {
                "type": "notify",  # method name
                "command": "new_notification",
                "notification": json.dumps(NotificationSerializer(notification).data)
            }
        )
        data = {
            'status': True,
            'message': "Request sent.",
        }
        return JsonResponse(data)
    else:
        pass


def accept_request(request, friend=None):
    if friend is not None:
        friend_user = User.objects.get(username=friend)
        current_user = request.user
        f = Friend.objects.filter(user=friend_user, friend=current_user, status='requested')[0]
        f.status = "friend"
        f.save()
        CustomNotification.objects.filter(recipient=current_user, actor=friend_user).delete()
        data = {
            'status': True,
            'message': "You accepted friend request",
        }
        return JsonResponse(data)
