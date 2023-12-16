
from django.contrib import admin
from django.urls import path,include
from Timetable import views

urlpatterns = [
   path('timetable/',views.timetable,name='timetable'),
   
]