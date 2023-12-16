
from django.contrib import admin
from django.urls import path,include
from Examinations import views

urlpatterns = [
   path('examinations/',views.examinations,name='examinations'),
   
]