from django.urls import path
from .views import dashboard, students, register_student,\
staffs, register_staff,staff_info, edit_staff, login, logout, registration, classes, classinfo, user, assignments, transportation, notice, calendar,edit_student
from . import views

urlpatterns = [
    path('', login, name='login'),
    path('registration/', registration, name='registration'),
    path('logout/', logout, name='logout'),
    path('dashboard/', dashboard, name='dashboard'),
    # --------------student urls-----------------
    path('students/', students, name='students'),
    path('register_student/', register_student, name='register_student'),
    path('student/edit_student/<slug:student_slug>/',edit_student, name='edit_student'),
    path("student/<slug:student_slug>/",views.student_info, name="student_info"),
    # --------------staff urls-----------------

    path('staffs/', staffs, name='staffs'),
    path('register_staff/', register_staff, name='register_staff'),
    path('staff/edit_staff/<slug:staff_slug>/',edit_staff, name='edit_staff'),
    path('staff/info/<slug:staff_slug>/',staff_info, name='staff_info'),
    path('classes/', classes, name='classes'),
    path('classinfo/<slug:slug>/', classinfo, name='classinfo'),
    path('user/', user, name='user'),
    path('assignments/', assignments, name='assignments'),
    path('transportation/', transportation, name='transportation'),
    path('notice/', notice, name='notice'), 
    path('calendar/', calendar, name='calendar'), 

]