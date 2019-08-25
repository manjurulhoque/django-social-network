from django.contrib import admin
from django.urls import path

from .views import *

app_name = 'accounts'

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),
]