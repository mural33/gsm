from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('', include('app.urls')),
    path('admin/', admin.site.urls),
    path('app/', include('app.urls')),
]+static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    