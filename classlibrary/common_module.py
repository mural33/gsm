import requests
from django.http import HttpResponse
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime, timedelta

import requests
from django.http import HttpResponse  # Import HttpResponse from Django

class Data:
    def __init__(self, api_link) -> None:
        self.api_link = api_link

    def get_data_by_institute_id(self, url="", jwt="", params={}):
        self.headers = {  # Fix typo in variable name (change 'heared' to 'headers')
            'accept': 'application/json',
            "Authorization": f"Bearer {jwt}"
        }
        self.total_url = f"{self.api_link}{url}"  # Use f-string for better readability
        self.response = requests.get(url=self.total_url, params=params, headers=self.headers)
        print(self.response)
        if self.response.status_code == 200:
            return self.response.json()
        else:
            return HttpResponse("Something went wrong", status=self.response.status_code)



