from django.shortcuts import render, redirect
from django.urls import reverse_lazy

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
    # posts = Post.objects.filter(user__in=friends_list_id)
    posts = Post.objects.prefetch_related('comments').select_related('user__profile').order_by('-created_at')
    return render(request, 'home.html', {'posts': posts, 'friends': friends})
