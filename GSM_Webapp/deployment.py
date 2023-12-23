import os
from .settings import *
from .settings import BASE_DIR

# setting DEBUG = False
DEBUG = False

# setting ALLOWED_HOSTS = ['*']
ALLOWED_HOSTS = ['*']

# seeting csrf cookie secure
CSRF_TRUSTED_ORIGINS = ["https://gsmwebtest.azurewebsites.net",'https://127.0.0.1:8003/'] 
CSRF_COOKIE_DOMAIN = 'https://gsmwebtest.azurewebsites.net'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_USE_SESSIONS = True

# middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
# static files
STATIC_URL = '/assets/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR,"assets")
]

# # whitenoise static files
# STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
# media files