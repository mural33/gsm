import os
from .settings import *
from .settings import BASE_DIR

# setting DEBUG = False
DEBUG = False
SECRET_KEY = 'django-insecure-0%60if2d8bu&pm&84%&_%ud#j_bg@_5*=hjn74rrr(s6rsk8kx'

# setting ALLOWED_HOSTS = ['*']
ALLOWED_HOSTS = ['*']

# seeting csrf cookie secure
# CSRF_TRUSTED_ORIGINS = ['https://'+ os.environ['WEBSITE_HOSTNAME']]

CSRF_TRUSTED_ORIGINS = [
    "https://gurukul-web-prod-si-as.azurewebsites.net",
    "https://gurukulwebtest.azurewebsites.net" # Testing Account
    ]
CORS_ALLOWED_ORIGINS = [
    "https://gurukul-web-prod-si-as.azurewebsites.net",
    "https://gurukulwebtest.azurewebsites.net" # Testing Account
]
CSRF_USE_SESSIONS = True

# middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'app.middleware.AuthenticateUserMiddleware'
]
# static files
STATIC_URL = '/assets/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR,"assets")
]

# # whitenoise static files
# STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
# media files