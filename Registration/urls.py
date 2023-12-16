
from django.contrib import admin
from django.urls import path,include
from Registration import views

urlpatterns = [
   path('Registration/',views.Registration,name='Registration'),
   
]