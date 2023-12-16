
from django.contrib import admin
from django.urls import path,include
from Notice import views

urlpatterns = [
   path('notice/',views.notice,name='notice'),
   
]