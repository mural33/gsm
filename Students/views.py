import os
from dotenv import load_dotenv
load_dotenv()
from django.shortcuts import redirect, render
from datetime import datetime
import requests
API_URL = os.environ.get("api_url")
# Create your views here.
def student(request):
  print("start",datetime.now())
  url = f"{API_URL}/Students/get_students_by_intitute/?institute_id=1"
  response = requests.get(url)
  print(response)
  if response.status_code == 200:
    data = response.json()
    payload = {
      'student_data': data
    }
    print("End",datetime.now())
    return render(request, 'students.html', payload)
  else:
        print("error End",datetime.now())
        # Handle the error case, e.g., return an error page or redirect
        return redirect("/students/")
  
