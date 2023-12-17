from django.urls import path
from .import views
urlpatterns = [
    path("accounts/",views.home_api,name='accounts'),
]
