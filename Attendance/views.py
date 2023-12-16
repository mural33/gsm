from django.shortcuts import render

# Create your views here.
def attendance(request):
  return render(request, 'attendance.html')