
from django.contrib import admin
from django.urls import path,include
from Transportation import views

urlpatterns = [
   path('transportation/',views.transportation,name='transportation'),
   
]