"""
Django settings for GSM_Webapp project.

Generated by 'django-admin startproject' using Django 4.2.3.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-0%60if2d8bu&pm&84%&_%ud#j_bg@_5*=hjn74rrr(s6rsk8kx'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']
# ALLOWED_HOSTS = ['localhost', 'http://127.0.0.1:8002/students/']
CSRF_TRUSTED_ORIGINS = [
    "https://gurukul-web-prod-si-as.azurewebsites.net",
    "https://gurukulwebtest.azurewebsites.net" # Testing Account
    ]
CORS_ALLOWED_ORIGINS = [
    "https://gurukul-web-prod-si-as.azurewebsites.net",
    "https://gurukulwebtest.azurewebsites.net" # Testing Account
]

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    "whitenoise.runserver_nostatic",
    "django.contrib.staticfiles",
    'corsheaders',
    'app'
]

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

ROOT_URLCONF = 'GSM_Webapp.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'GSM_Webapp.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/


STATIC_URL = os.environ.get("DJANGO_STATIC_URL", "/assets/")
STATIC_ROOT = os.path.join(BASE_DIR, 'assets_dy')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'assets'),
]
# STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


API_ENDPOINT="https://gurukul-api-prod-si-as.azurewebsites.net"
# API_ENDPOINT="http://127.0.0.1:8000"
SUBSCRIPTION_URL = "https://alongx-subscriptionapi-prod-si-as.azurewebsites.net/"

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AZURE_STORAGE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=gsmstore;AccountKey=tKc6zDb61jnf7GSHQWwX6S5Uz83twOtNczf6GUhq/1S0mBixn/Qx2Mwh6QibQSSYaKv/iRd2zS24+AStTtOf5g==;EndpointSuffix=core.windows.net"
AZURE_CONTAINERS = {
    "student_documents": "student-documents",
    "student_profile": "student-profile-pictures",
    "student_assignment_document": "student-assignment-documents",
    "staff_documents": "staff-documents",
    "staff_profile": "staff-profile-pictures",
    "user_profile": "user-profile",
    "institute_logo": "institute-logo",
    "fav_icon": "fav-icon",
}

RAZOR_KEY_ID = 'rzp_test_zHYLFNKQEQRRrc'
RAZOR_KEY_SECRET = 'FpcYza0wTVpxd99CpYoGyhP8'