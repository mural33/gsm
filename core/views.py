import requests
from django.http import HttpResponse
from django.shortcuts import redirect, render
from faker import Faker
fake = Faker()
from datetime import datetime
import random
import requests

def home_api(req):
    print(datetime.now())
    url = 'http://127.0.0.1:8000/Accounts/'
    response = requests.get(url)
    print(response)
    if response.status_code == 200:
        data = response.json()
        print(datetime.now())
        return render(req, 'accounts.html', {'data': data})
    else:
        # Handle the error case, e.g., return an error page or redirect
        return redirect("/")


