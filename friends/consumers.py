import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.core import serializers

from .models import CustomNotification, Friend
from .serializers import NotificationSerializer, FriendshipRequestSerializer

User = get_user_model()


class FriendRequestConsumer(AsyncJsonWebsocketConsumer):

    @database_sync_to_async
    def fetch_friend_requests(self):
        user = self.scope['user']

        friend_requests = Friend.objects.got_friend_requests(user=user)
        serializer = FriendshipRequestSerializer(friend_requests, many=True)
        content = {
            'type': 'all_friend_requests',
            'command': 'all_friend_requests',
            'friend_requests': serializer.data
        }
        return content

    async def send_all_friend_requests(self):
        user = self.scope['user']
        if user.is_anonymous:
            return {'type': 'anonymous_user', 'command': 'all_friend_requests', 'friend_requests': []}
        content = await self.fetch_friend_requests()
        channel = "all_friend_requests_{}".format(user.username)
        await self.channel_layer.group_send(channel, content)

    def notifications_to_json(self, notifications):
        result = []
        for notification in notifications:
            result.append(self.notification_to_json(notification))
        return result

    @staticmethod
    def notification_to_json(notification):
        return {
            'actor': serializers.serialize('json', [notification.actor]),
            'recipient': serializers.serialize('json', [notification.recipient]),
            'verb': notification.verb,
            'created_at': str(notification.timestamp)
        }

    async def connect(self):
        user = self.scope['user']
        grp = 'all_friend_requests_{}'.format(user.username)
        await self.accept()
        await self.channel_layer.group_add(grp, self.channel_name)
        await self.send_all_friend_requests()

    async def disconnect(self, close_code):
        user = self.scope['user']
        grp = 'all_friend_requests_{}'.format(user.username)
        await self.channel_layer.group_discard(grp, self.channel_name)

    async def all_friend_requests(self, event):
        await self.send_json(event)

    async def notify(self, event):
        await self.send_json(event)

    async def anonymous_user(self, event):
        await self.send_json(event)

    async def receive(self, text_data=None, bytes_data=None, **kwargs):
        data = json.loads(text_data)
        # if data['command'] == 'fetch_friend_requests':
        #     await self.fetch_friend_requests()
