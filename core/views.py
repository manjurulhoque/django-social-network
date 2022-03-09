from django.shortcuts import render, redirect
from django.urls import reverse_lazy

from friends.models import Friend
from newsfeed.models import Post


def home(request):
    if not request.user.is_authenticated:
        return redirect(reverse_lazy('accounts:login'))

    friends = Friend.objects.friends(request.user)
    # posts = Post.objects.filter(user__in=friends_list_id)
    posts = Post.objects.prefetch_related('comments').select_related('user__profile').order_by('-created_at')
    return render(request, 'home.html', {'posts': posts, 'friends': friends})
