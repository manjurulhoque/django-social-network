from django.db import models


class NotificationManager(models.Manager):

    def user_unread_notification_count(self, user) -> int:
        if not user:
            return 0
        return self.filter(is_read=False, recipient=user).count()
