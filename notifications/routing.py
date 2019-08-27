from django.urls import re_path

from .consumers import *

websocket_urlpatterns = [
    re_path(r'^ws/like-comment-notification/$', NotificationConsumer),
]
