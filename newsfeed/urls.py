from django.urls import path
from .views import *

app_name = "newsfeed"

urlpatterns = [
    path('post/create', PostCreateView.as_view(), name="post-create"),
    path('comment/create/<int:post_id>', create_comment, name="comment-create"),
]
