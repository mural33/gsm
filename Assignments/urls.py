
from django.contrib import admin
from django.urls import path,include
from Assignments import views

urlpatterns = [
   path('assignments/',views.assignments,name='assignments'),
   
]
