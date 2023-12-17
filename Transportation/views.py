from django.shortcuts import redirect, render
from datetime import datetime
import requests
from faker import Faker
fake = Faker()
import random

# Create your views here.
from GSM_Webapp.settings import API_URL
# URL = os.environ.get('api_url')
URL = API_URL



def transportation(request):
  print("start",datetime.now())
  url = f"{URL}/Transport/get_all_transports/"
  response = requests.get(url)
  if response.status_code == 200:
    data = response.json()
    payload = {
      'transportation': data,
      'URL':URL,
    }
    print("End",datetime.now())
    return render(request, 'transportation.html', payload)
  else:
        print("error End",datetime.now())
        # Handle the error case, e.g., return an error page or redirect
        return redirect("/transportation/")
  


def stapages(request):
  print("start",datetime.now())
  url = f'{URL}Stops/get_all_stopages/'
  response = requests.get(url)
  if response.status_code == 200:
    data = response.json()
    payload = {
      'stopage': data
    }
    print("End",datetime.now())
    return render(request, 'transportation.html', payload)
  else:
        print("error End",datetime.now())
        # Handle the error case, e.g., return an error page or redirect
        return redirect("/transportation/")