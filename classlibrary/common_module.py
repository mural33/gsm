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
        self.headers = {"accept": "application/json", "Authorization": f"Bearer {jwt}"}
        self.total_url = f"{self.api_link}{url}" 
        self.response = requests.get(
            url=self.total_url, params=params, headers=self.headers
        )
        print(self.response)
        if self.response.status_code == 200:
            return self.response.json()
        else:
            return []

    def get_class_data(self, end_point="", jwt="", params={}):
        self.headers = {"accept": "application/json", "Authorization": f"Bearer {jwt}"}
        self.total_url = f"{self.api_link}{end_point}"
        self.response = requests.get(
            url=self.total_url, params=params, headers=self.headers
        )
        if self.response.status_code == 200:
            return {"data": self.response.json(), "status": self.response.status_code}
        else:
            return {"data": self.response.json(), "status": self.response.status_code}
