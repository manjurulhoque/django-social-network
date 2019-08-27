import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from django.core import serializers

from friends.models import CustomNotification
from friends.serializers import NotificationSerializer

User = get_user_model()


class NotificationConsumer(AsyncJsonWebsocketConsumer):

    async def fetch_messages(self):
        user = self.scope['user']
        notifications = CustomNotification.objects.select_related('actor').filter(recipient=user, type="comment", unread=True)[:7]
        serializer = NotificationSerializer(notifications, many=True)
        content = {
            'command': 'notifications',
            'notifications': json.dumps(serializer.data)
        }
        await self.send_json(content)

    async def connect(self):
        user = self.scope['user']
        grp = 'comment_like_notifications_{}'.format(user.username)
        await self.accept()
        await self.channel_layer.group_add(grp, self.channel_name)

    async def disconnect(self, close_code):
        user = self.scope['user']
        grp = 'comment_like_notifications_{}'.format(user.username)
        await self.channel_layer.group_discard(grp, self.channel_name)

    async def notify(self, event):
        await self.send_json(event)

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        data = json.loads(text_data)
        if data['command'] == 'fetch_like_comment_notifications':
            await self.fetch_messages()
