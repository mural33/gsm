from django.shortcuts import render

# Create your views here.
def Registration(request):
  return render(request, 'Registration.html')