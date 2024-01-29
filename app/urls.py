from django.urls import path
from .views import dashboard, students, student_alumni,register_student,\
staffs, register_staff,staff_info, edit_staff, logout,classes,fees, user, assignments, transportation, notice, notice_create,notice_edit, calendar,edit_student,examination,examinationInfo
from . import views
from django.views.generic import TemplateView

urlpatterns = [
    # path('', login, name='login'),
    # path('registration/', registration, name='registration'),
    path('logout/', logout, name='logout'),
    path('dashboard/', dashboard, name='dashboard'),
    # --------------student urls-----------------
    path('students/', students, name='students'),
    path("student/studentsPromotion/",views.promote_students, name="students_promotion"),
    path('register_student/', register_student, name='register_student'),
    path('student/edit_student/<slug:student_slug>/',edit_student, name='edit_student'),
    path('student_alumni/',student_alumni,name='student_alumni'),
    path("student/<slug:student_slug>/",views.student_info, name="student_info"),
    # --------------staff urls-----------------

    path('staffs/', staffs, name='staffs'),
    path('register_staff/', register_staff, name='register_staff'),
    path('staff/edit_staff/<slug:staff_slug>/',edit_staff, name='edit_staff'),
    path('staff/info/<slug:staff_slug>/',staff_info, name='staff_info'),
    path('classes/', classes, name='classes'),
    path('user/', user, name='user'),
    path('assignments/', assignments, name='assignments'),
    path('assignmentinfo/<str:assignment_slug>/', views.assignmentinfo, name='assignmentinfo'),
    path('transportation/', transportation, name='transportation'),
    path('notice/', notice, name='notice'),
    path('notice_create/', notice_create, name='notice_create'),
    path('notice_edit/<int:notice_id>/', notice_edit, name='notice_edit'),
    path('calendar/', calendar, name='calendar'), 
    path('gradings/', views.gradings, name='gradings'),
    path('accounts/', views.accounts, name='accounts'),
    path('azure_upload/', views.azure_upload, name='azure_upload'),
    path('azure_download/<str:file_name>/<str:location>/', views.azure_download, name='azure_download'),
    path('fees/',fees,name='fees'),
    path('examination/',examination,name='examination'),
    path('examinationInfo/<slug:exam_slug>',examinationInfo,name="examinationinfo"),
    path('generate_excel_file_for_result/<int:parent_exam_id>',views.generate_excel_file_for_result,name="generate_excel_file_for_result"),
    path('settings/', views.settings, name='settings'),
    path('profile/', views.profile, name='profile'),
    path('success/', TemplateView.as_view(template_name='success.html'), name='success'),
    path('error/', TemplateView.as_view(template_name='error.html'), name='error'),
    path('create_order/', views.create_order, name='create_order'),
    path('attendance/',views.attendance,name='attendance'),
    path('staffIdCard/<slug:staff_slug>', views.staffIdCard, name='staffIdCard'),
    path('studentIdCard/<slug:student_slug>', views.studentIdCard, name='studentIdCard'),
    path('', views.signin, name='signin'),
    path('signup/', views.signup, name='signup'),
    path('forgetPassword/', views.forgetPassword, name='forgetPassword'),
    path('reports/', views.reports, name='reports'),
    path('renewProduct/', views.renew_product, name='renewProduct'),
]