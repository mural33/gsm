from django.shortcuts import render

# Create your views here.
def staffs(request):
  return render(request, 'staffs.html')