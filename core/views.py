from django.shortcuts import render, redirect
from django.urls import reverse_lazy

from newsfeed.models import Post


def home(request):
    if not request.user.is_authenticated:
        return redirect(reverse_lazy('accounts:login'))

    posts = Post.objects.all().select_related('user')
    return render(request, 'home.html', {'posts': posts})
