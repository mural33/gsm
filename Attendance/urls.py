
from django.contrib import admin
from django.urls import path,include
from Attendance import views

urlpatterns = [
   path('attendance/',views.attendance,name='attendance'),
   
]