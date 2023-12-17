from django.shortcuts import redirect, render
from datetime import datetime
import requests
from faker import Faker
fake = Faker()
import random
import os
from GSM_Webapp.settings import API_URL
# URL = os.environ.get('api_url')
URL = API_URL

# Create your views here.
def staffs(request):

  url = f'{URL}/StaffS/get_staffs_by_institute/?institute_id=1'
  response = requests.get(url)
  if response.status_code == 200:
    data = response.json()
    payload = {
      'staff_data': data,
      'URL' : URL
    }
    print("End",datetime.now())
    return render(request, 'staffs.html', payload)
  else:
        print("error End",datetime.now())
        return redirect("/staffs/")
  