from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import WebsocketConsumer, JsonWebsocketConsumer, AsyncJsonWebsocketConsumer
import json
from django.db.models import Q
from .models import Message, Room

User = get_user_model()


class ChatConsumer(WebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = None
        self.room = None

    def fetch_messages(self, data):
        author = User.objects.get(username=data['author'])
        friend = User.objects.get(username=data['friend'])
        messages = Message.objects.filter(Q(author=author, friend=friend) | Q(author=friend, friend=author)).order_by(
            'timestamp')[:20]
        content = {
            'command': 'messages',
            'messages': self.messages_to_json(messages)
        }
        self.send_message(content)

    def new_message(self, data):
        author = data['from']
        friend = data['friend']
        author_user = User.objects.filter(username=author)[0]
        friend_user = User.objects.filter(username=friend)[0]
        message = Message.objects.create(
            author=author_user,
            friend=friend_user,
            room=self.room,
            message=data['message'])
        content = {
            'command': 'new_message',
            'message': self.message_to_json(message)
        }
        channel_layer = get_channel_layer()
        channel = "notifications_{}".format(friend_user.username)
        async_to_sync(channel_layer.group_send)(
            channel, {
                "type": "notify",  # method name
                "notification": {
                    "title": "Message",
                    "body": author_user.username + " messaged you"
                }
            }
        )
        return self.send_chat_message(content)

    def messages_to_json(self, messages):
        result = []
        for message in messages:
            result.append(self.message_to_json(message))
        return result

    def message_to_json(self, message):
        return {
            'author': message.author.username,
            'friend': message.friend.username,
            'content': message.message,
            'timestamp': str(message.timestamp)
        }

    commands = {
        'fetch_messages': fetch_messages,
        'new_message': new_message
    }

    def connect(self):
        self.user = self.scope['user']
        self.friendname = self.scope['url_route']['kwargs']['friendname']
        author_user = User.objects.filter(username=self.user.username)[0]
        friend_user = User.objects.filter(username=self.friendname)[0]
        if Room.objects.filter(
                Q(author=author_user, friend=friend_user) | Q(author=friend_user, friend=author_user)).exists():
            self.room = Room.objects.filter(
                Q(author=author_user, friend=friend_user) | Q(author=friend_user, friend=author_user))[0]
        else:
            self.room = Room.objects.create(author=author_user, friend=friend_user)
        self.room_group_name = 'chat_%s' % str(self.room.id)
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    def receive(self, text_data):
        data = json.loads(text_data)
        self.commands[data['command']](self, data)

    def send_chat_message(self, message):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    def send_message(self, message):
        self.send(text_data=json.dumps(message))

    def chat_message(self, event):
        message = event['message']
        self.send(text_data=json.dumps(message))
