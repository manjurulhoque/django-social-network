from django.db import models

from accounts.models import User
from django.utils.timezone import now


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()
    created_at = models.DateTimeField(default=now)
