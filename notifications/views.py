from django.http import JsonResponse
from django.shortcuts import render

from friends.models import CustomNotification


def mark_like_comment_notifications_as_read(request):
    CustomNotification.objects.filter(recipient=request.user, type="comment").update(unread=False)
    return JsonResponse({
        'status': True,
        'message': "Marked all notifications as read"
    })
