from django.db import models

from accounts.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.DO_NOTHING, related_name='profile')
    profile_image = models.ImageField(upload_to='avatars', default='avatars/guest.png')
    cover_image = models.ImageField(upload_to='avatars', default='avatars/cover.png')
    phone = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=20, blank=True)


@receiver(post_save, sender=User)
def create_profile(sender, **kwargs):
    if kwargs.get('created', False):
        Profile.objects.create(user=kwargs['instance'])
