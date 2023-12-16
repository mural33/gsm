from django.shortcuts import render

# Create your views here.
def transportation(request):
  return render(request, 'transportation.html')