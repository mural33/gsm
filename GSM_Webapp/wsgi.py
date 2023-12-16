import os
from django.core.wsgi import get_wsgi_application
from .settings import BASE_DIR
from whitenoise import WhiteNoise

application = get_wsgi_application()
application = WhiteNoise(application, root=BASE_DIR / 'static')
application.add_files(BASE_DIR / 'static', prefix='more-files/')
