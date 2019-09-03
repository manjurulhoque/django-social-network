import uuid

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(User, related_name='author_room', on_delete=models.CASCADE)
    friend = models.ForeignKey(User, related_name='friend_room', on_delete=models.CASCADE)


class Message(models.Model):
    author = models.ForeignKey(User, related_name='author_messages', on_delete=models.CASCADE)
    friend = models.ForeignKey(User, related_name='friend_messages', on_delete=models.CASCADE)
    room = models.ForeignKey(Room, related_name='messages', on_delete=models.DO_NOTHING)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message + " " + str(self.timestamp)
