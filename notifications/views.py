from django.views.generic import ListView
from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.mixins import LoginRequiredMixin

from friends.models import CustomNotification


class UserAllNotificationListView(LoginRequiredMixin, ListView):
    """
    Get all notifications for the user
    """


def mark_like_comment_notifications_as_read(request):
    CustomNotification.objects.filter(recipient=request.user, type="comment").update(unread=False)
    return JsonResponse({
        'status': True,
        'message': "Marked all notifications as read"
    })
