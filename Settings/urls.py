
from django.contrib import admin
from django.urls import path,include
from Settings import views

urlpatterns = [
   path('settings/',views.settings,name='settings'),
   
]