
from django.contrib import admin
from django.urls import path,include
from Gradings import views

urlpatterns = [
   path('gradings/',views.gradings,name='gradings'),
   
]