from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
from django.urls import reverse
import requests

class Login:
    def __init__(self, api_link) -> None:
        self.api_url = api_link  # Basic FastApi url 

    def authenticate_user(self, email, password):
        end_point = '/Login/token'  # FastApi end point for login
        payload = {
            "grant_type": "",
            "username": email,
            'password': password,
            'scope': '',
        }
        total_url = self.api_url + end_point
        auth_response = requests.post(total_url, payload)
        if auth_response.status_code == 200:
            # Authentication successful, set the cookie
            response = HttpResponseRedirect(reverse('dashboard'))
            # Set the access token in the cookie
            response.set_cookie(key='access_token', value=auth_response.json().get('access_token'))
            response.set_cookie(key='institute_id', value=auth_response.json().get('institution_id'))
            return response
        else:
            # Authentication failed
            print(f"Error: {auth_response.status_code}, {auth_response.text}")
            response = HttpResponseRedirect(reverse('login'))
            return response