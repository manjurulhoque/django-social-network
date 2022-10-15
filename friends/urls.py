from django.urls import path
from .views import *

app_name = "friends"

urlpatterns = [
    path('find-friends', FindFriendsListView.as_view(), name="find-friends"),
    path('friend-requests', FriendRequestsListView.as_view(), name="friend-requests"),
    path('send-request/<slug:username>', send_request, name="send-request"),
    path('accept-request/<slug:friend>', accept_request, name="accept-request"),
    path('cancel-request/<slug:friend>', cancel_request, name="cancel-request"),
]
