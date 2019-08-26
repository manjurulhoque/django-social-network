from rest_framework import serializers

from accounts.models import User
from .models import CustomNotification


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ("password",)


class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model = CustomNotification
        fields = "__all__"
