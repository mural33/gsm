from django.shortcuts import render
import requests
from django.http import HttpResponse
from django.shortcuts import redirect, render
from faker import Faker
fake = Faker()
from datetime import datetime
import random
import requests
import os
from dotenv import load_dotenv


load_dotenv()
URL = os.environ.get('api_url')

def classes(req):
    # print(datetime.now())
    url = f'{URL}Classes/get_classes_by_institute/?institite_id=1'
    response = requests.get(url)
    # print(response)
    if response.status_code == 200:
        data = response.json()
        payload = {
      'class_data': data,
      'URL':URL,
        }
        # print(datetime.now())
        return render(req, 'classes.html', payload)
    else:
        return redirect("/classes/")
    


def classinfo(request, slug):
    classId = slug
    print('classId', classId)

    if classId is not None:
        # Replace the URL with your actual API endpoint to get class details
        class_url = f'{URL}Classes/get_classes_by_field/slug/{classId}'
        class_response = requests.get(class_url)

        if class_response.status_code == 200:
            class_data = class_response.json()
            response_data = class_data[0] if class_data else {}
            class_name = response_data.get('class_name')
            class_id = response_data.get('class_id')
            # print('class_data:', class_data)
            # print('class_name:', class_name)

            # Use the class_id to fetch section details
            section_url = f'{URL}Sections/get_sections_by_class/?class_id={class_id}'
            section_response = requests.get(section_url)
            
            subject_url = f'{URL}Subjects/get_subjects_by_class/?class_id={class_id}'
            subject_response = requests.get(subject_url)

            if section_response.status_code == 200:
                section_data = section_response.json()
            
            if subject_response.status_code == 200:
                subject_data = subject_response.json()
                # print('section_data:', section_data)

                payload = {
                    'class_data': class_data,
                    'class_name': class_name,
                    'class_id':class_id,
                    'section_data': section_data,
                    'subject_data':subject_data,
                }

                return render(request, 'classinfo.html', payload)

