from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.db.models import Q

from friends.models import Friend
from newsfeed.models import Post


def home(request):
    if not request.user.is_authenticated:
        return redirect(reverse_lazy('accounts:login'))

    friends_one = Friend.objects.filter(friend=request.user).filter(status='friend')
    friends_two = Friend.objects.filter(user=request.user).filter(status='friend')
    friends_list_one = list(friends_one.values_list('user_id', flat=True))
    friends_list_two = list(friends_two.values_list('friend_id', flat=True))
    friends_list_id = friends_list_one + friends_list_two + [request.user.id]
    friends = friends_one.union(friends_two)
    posts = Post.objects.filter(user__in=friends_list_id)
    return render(request, 'home.html', {'posts': posts, 'friends': friends})
