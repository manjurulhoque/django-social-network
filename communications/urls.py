from django.urls import path
from .views import *

app_name = "communications"

urlpatterns = [
    path('', all_messages, name="all-messages"),
    path('<slug:friend>', messages_with_one_friend, name="messages-with-one-friend"),
]
