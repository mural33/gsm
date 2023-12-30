from django.http import HttpResponse, HttpResponseRedirect
from django.contrib import messages
from django.urls import reverse
import requests


class Login:
    def __init__(self, api_link) -> None:
        self.api_url = api_link  # Basic FastApi url

    def authenticate_user(self, email, password):
        end_point = "/Login/token"
        payload = {
            "grant_type": "",
            "username": email,
            "password": password,
            "scope": "",
        }
        total_url = self.api_url + end_point
        auth_response = requests.post(total_url, payload)

        if auth_response.headers.get("Content-Type") == "application/json":
            try:
                json_data = auth_response.json()
                return json_data
            except ValueError:
                # JSON decoding failed
                return {"error": "Invalid JSON in response"}
        else:
            # If the content type is not JSON, return the original response
            return {"error": "Non-JSON response", "response": auth_response.text}
