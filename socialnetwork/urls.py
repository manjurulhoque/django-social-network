from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('accounts.urls')),
    path('', include('notifications.urls')),
    path('', include('core.urls')),
    path('', include('newsfeed.urls')),
    path('', include('friends.urls')),
    path('timeline/', include('userprofile.urls')),
    path('messages/', include('communications.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
