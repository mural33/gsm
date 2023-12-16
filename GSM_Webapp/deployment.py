import os
from .settings import *
from .settings import BASE_DIR

# setting DEBUG = False
DEBUG = False

# setting ALLOWED_HOSTS = ['*']
ALLOWED_HOSTS = ['*']

# seeting csrf cookie secure
CSRF_Trusted_Origins = ['*']

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
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR,"static")
]

# whitenoise static files
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
# media files