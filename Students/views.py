from django.shortcuts import redirect, render
from datetime import datetime
import os
import requests
from faker import Faker
fake = Faker()
import random

URL = "https://gsm-fastapi.azurewebsites.net"


def student(request):
    print("start", datetime.now())
    url_students = f'{URL}Students/get_students_by_intitute/?institute_id=1'
    print("url students", url_students)
    response_students = requests.get(url_students)
    if response_students.status_code == 200:
        data_students = response_students.json()
        payload = {
            'student_data': data_students,
            'URL': URL
            
        }    
        print("End", datetime.now())
        return render(request, 'students.html', payload)
    else:
        print("error End", datetime.now())
        return redirect("/students/")