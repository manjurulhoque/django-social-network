import json

from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.utils.safestring import mark_safe

from accounts.models import User
from friends.models import Friend


def all_messages(request):
    friends_one = Friend.objects.filter(friend=request.user, status='friend')
    friends_two = Friend.objects.filter(user=request.user, status='friend')
    friends = friends_one | friends_two
    return render(request, "communications/all-messages.html", {'friends': friends})


# Conversation with one friend
@login_required(login_url=reverse_lazy("accounts:login"))
def messages_with_one_friend(request, friend):
    if request.user.username == friend:
        return redirect(reverse_lazy('communications:all-messages'))
    try:
        if not User.objects.get(username=friend):
            return redirect(reverse_lazy('communications:all-messages'))
    except:
        return redirect(reverse_lazy('communications:all-messages'))
    friends_one = Friend.objects.filter(friend=request.user, status='friend')
    friends_two = Friend.objects.filter(user=request.user, status='friend')
    friends = friends_one | friends_two
    return render(request, "communications/friend-messages.html", {
        'friends': friends,
        'friend_name_json': mark_safe(json.dumps(friend)),
        'username': mark_safe(json.dumps(request.user.username)),
    })
