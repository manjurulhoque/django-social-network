from django.urls import path
from .views import *

app_name = "notifications"

urlpatterns = [
    path('mark-like-comment-notifications-as-read', mark_like_comment_notifications_as_read, name="mark-like-comment-notifications-as-read"),
]
