from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import redirect
from django.urls import reverse
import requests
API_URL = settings.API_ENDPOINT
token_checking_url = f'{API_URL}/Login/protected-data'

class AuthenticateUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.api_link = API_URL

    def check_token_validation(self, access_token):
        headers = {
            'accept': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        response = requests.get(url=token_checking_url, headers=headers)
        return response.status_code == 200

    def __call__(self, request):
        access_token = request.COOKIES.get('access_token')
        allowed_paths = ['/registration/',reverse('login'),'/',reverse("registration")]
        if not access_token and request.path in allowed_paths:
            response = self.get_response(request)
            return response
        
        # stoping the user if login page is not login and access token is not valid
        if access_token and self.check_token_validation(access_token) and request.path in allowed_paths:
            return HttpResponseRedirect(reverse('dashboard'))
        
        # checking the access token is valid or not
        if access_token and self.check_token_validation(access_token):
            return self.get_response(request)
        else:
            response = redirect("/") # if it not work then use HttpResponseRedirect(reverse('login'))
            response.delete_cookie('access_token') # removeing acces token from cookie
            return response 
