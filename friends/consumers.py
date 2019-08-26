import json

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from django.core import serializers

from .models import CustomNotification

User = get_user_model()


class FriendRequestConsumer(AsyncJsonWebsocketConsumer):

    async def fetch_messages(self):
        user = self.scope['user']
        notifications = CustomNotification.objects.filter(recipient=user, type="friend")
        content = {
            'command': 'notifications',
            'notifications': serializers.serialize('json', notifications)
        }

        await self.send_json(content)

    async def connect(self):
        user = self.scope['user']
        grp = 'notifications_{}'.format(user.username)
        await self.accept()
        await self.channel_layer.group_add(grp, self.channel_name)

    async def disconnect(self, close_code):
        user = self.scope['user']
        grp = 'notifications_{}'.format(user.username)
        await self.channel_layer.group_discard(grp, self.channel_name)

    async def notify(self, event):
        await self.send_json(event)

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        data = json.loads(text_data)
        if data['command'] == 'fetch_friend_notifications':
            await self.fetch_messages()
