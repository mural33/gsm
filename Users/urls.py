
from django.contrib import admin
from django.urls import path,include
from Users import views

urlpatterns = [
   path('users/',views.users,name='users'),
   
]