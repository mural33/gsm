from django.shortcuts import render

# Create your views here.
def assignments(request):
  return render(request, 'assignments.html')