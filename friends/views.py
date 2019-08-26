from accounts.models import User
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.http import JsonResponse
from django.views.generic import ListView

from .models import *


class FindFriendsListView(ListView):
    model = Friend
    context_object_name = 'users'
    template_name = "friends/find-friends.html"

    def get_queryset(self):
        current_user_friends = self.request.user.friends.values('id')
        sent_request = Friend.objects.values('id')
        users = User.objects.exclude(id__in=current_user_friends).exclude(id__in=sent_request).exclude(id=self.request.user.id)
        return users


def send_request(request, username=None):
    if username is not None:
        friend_user = User.objects.get(username=username)
        friend = Friend.objects.create(user=request.user, friend=friend_user)
        CustomNotification.objects.create(type="friend", recipient=friend_user, actor=request.user, verb="sent you friend request")
        channel_layer = get_channel_layer()
        channel = "notifications_{}".format(friend_user.username)
        async_to_sync(channel_layer.group_send)(
            channel, {
                "type": "notify",  # method name
                "notification": {
                    "title": "Friend Request",
                    "body": request.user.username + " send you friend request"
                }
            }
        )
        data = {
            'status': True,
            'message': "Request sent.",
        }
        return JsonResponse(data)
    else:
        pass
