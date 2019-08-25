from django.shortcuts import render, redirect
from django.urls import reverse_lazy


def home(request):
    if not request.user.is_authenticated:
        return redirect(reverse_lazy('accounts:login'))
    return render(request, 'home.html', {})
