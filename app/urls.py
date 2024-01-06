from django.urls import path
from .views import dashboard, students, register_student,\
staffs, register_staff,staff_info, edit_staff, login, logout, registration, classes, user, assignments, transportation, notice, notice_create,notice_edit, calendar,edit_student
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
    path('user/', user, name='user'),
    path('assignments/', assignments, name='assignments'),
    path('transportation/', transportation, name='transportation'),
    path('notice/', notice, name='notice'),
    path('notice_create/', notice_create, name='notice_create'),
    path('notice_edit/<int:notice_id>/', notice_edit, name='notice_edit'),
    path('calendar/', calendar, name='calendar'), 
    path('gradings/', views.gradings, name='gradings'),
    path('accounts/', views.accounts, name='accounts'),
]