ALLOWED_HOSTS = ['56.228.81.228', 'localhost', '127.0.0.1']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'crmdb',
        'USER': 'crmadmin',
        'PASSWORD': 'CrmPass2024!',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
