
from django.contrib import admin
from django.urls import path,include
from Staffs import views

urlpatterns = [
   path('staffs/',views.staffs,name='staffs'),
   
]