from django.urls import path
from .views import dashboard, students, staffs, login, logout, registration, classes, classinfo, user, assignments, transportation, notice
from . import views

urlpatterns = [
    path('', login, name='login'),
    path('registration/', registration, name='registration'),
    path('logout/', logout, name='logout'),
    path('dashboard/', dashboard, name='dashboard'),
    path('students/', students, name='students'),
    path('staffs/', staffs, name='staffs'),
    path('classes/', classes, name='classes'),
    path('classinfo/<slug:slug>/', classinfo, name='classinfo'),
    path('user/', user, name='user'),
    path('assignments/', assignments, name='assignments'),
    path('transportation/', transportation, name='transportation'),
    path('notice/', notice, name='notice'), 

]