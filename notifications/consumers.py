import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.core import serializers

from friends.models import CustomNotification
from friends.serializers import NotificationSerializer

User = get_user_model()


@database_sync_to_async
def get_data(user):
    return CustomNotification.objects.select_related('actor').filter(recipient=user, type="comment", unread=True)[:7]


class NotificationConsumer(AsyncJsonWebsocketConsumer):

    @database_sync_to_async
    def fetch_notifications(self):
        user = self.scope['user']
        if user.is_anonymous:
            return {'type': 'anonymous_user'}
        notifications = CustomNotification.objects.select_related('actor').filter(recipient=user, verb="comment",
                                                                                  is_read=False)[:4]
        serializer = NotificationSerializer(notifications, many=True)
        content = {
            'type': 'all_notifications',
            'command': 'notifications',
            'notifications': serializer.data,
            'unread_notifications': CustomNotification.objects.user_unread_notification_count(user)
        }
        return content
        # return self.send(text_data=json.dumps(content))

    async def send_all_notifications(self):
        user = self.scope['user']
        content = await self.fetch_notifications()
        channel = "comment_like_notifications_{}".format(user.username)
        await self.channel_layer.group_send(channel, content)

    async def connect(self):
        user = self.scope['user']
        grp = 'comment_like_notifications_{}'.format(user.username)
        await self.accept()
        await self.channel_layer.group_add(grp, self.channel_name)
        await self.send_all_notifications()

    async def disconnect(self, close_code):
        user = self.scope['user']
        grp = 'comment_like_notifications_{}'.format(user.username)
        await self.channel_layer.group_discard(grp, self.channel_name)

    async def notify(self, event):
        await self.send_json(event)

    async def all_notifications(self, event):
        await self.send_json(event)

    async def anonymous_user(self, event):
        await self.send_json(event)

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        data = json.loads(text_data)
        # if data['command'] == 'fetch_like_comment_notifications':
        #     await self.fetch_notifications()
