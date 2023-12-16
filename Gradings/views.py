from django.shortcuts import render

# Create your views here.
def gradings(request):
  return render(request, 'gradings.html')