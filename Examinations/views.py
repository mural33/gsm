from django.shortcuts import render

# Create your views here.
def examinations(request):
  return render(request, 'examinations.html')