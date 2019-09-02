from django.urls import path
from .views import *

app_name = "profile"

urlpatterns = [
    path('<slug:username>', TimelineView.as_view(), name="user-timeline"),
]
