from django.shortcuts import redirect, render
from datetime import datetime
import os
import requests
from faker import Faker
fake = Faker()
import random
from dotenv import load_dotenv
load_dotenv()
URL = os.environ.get('api_url')


def student(request):
    print("start", datetime.now())
    
    # use that .env variable here
    print("URL", URL)
    

    url_students = f'{URL}Students/get_students_by_intitute/?institute_id=1'
    print("url students", url_students)
    response_students = requests.get(url_students)

    if response_students.status_code == 200:
        data_students = response_students.json()
        updated_student_data = []

        for student in data_students:
            class_id = student.get('class_id')

            # Fetching class name based on class_id from the class API
            url_class = f'https://gsm-fastapi.azurewebsites.net/Classes/class_id/?class_id={class_id}'
            response_class = requests.get(url_class)

            if response_class.status_code == 200:
                class_data = response_class.json()
                print("class_data", class_data)
                
                class_name = class_data['response'].get('class_name')
                print("class_name", class_name)
            else:
                class_name = "N/A" 

            section_id = student.get('section_id') 
            url_section = f'https://gsm-fastapi.azurewebsites.net/Sections/section_id/?section_id={section_id}'
            response_section = requests.get(url_section)

            if response_section.status_code == 200:
                section_data = response_section.json()
                section_name = section_data['response'].get('section_name')
            else:
                section_name = "N/A"  

            
            student['class_name'] = class_name
            student['section_name'] = section_name
            
            updated_student_data.append(student)

        payload = {
            'student_data': updated_student_data,
            'URL': URL
            
        }

        print("End", datetime.now())
        return render(request, 'students.html', payload)
    else:
        print("error End", datetime.now())
        
        return redirect("/students/")