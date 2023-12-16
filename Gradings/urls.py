
from django.contrib import admin
from django.urls import path,include
from Gradings import views

urlpatterns = [
   path('',views.gradings,name='gradings'),
   
]