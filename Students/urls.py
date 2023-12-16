
from django.contrib import admin
from django.urls import path,include
from Students import views

urlpatterns = [
   path('students/',views.student,name='students'),
   
]
