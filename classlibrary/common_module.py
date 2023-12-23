import requests
from django.http import HttpResponse
from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime, timedelta

class Data:
    def __init__(self,api_link) -> None:
        self.api_link = api_link

    def get_data_by_institute_id(self,url="",jwt="",params = {}):
        self.heared = {
            'accept': 'application/json',
            'Authorization': f'Bearer {jwt}'
        }
        self.total_url = self.api_link + url
        self.responce = requests.get(url=self.total_url ,params=params,headers=self.heared)
        if self.responce.status_code == 200:
            return self.responce.json()
        else:
            return HttpResponse("Something went wrong")


