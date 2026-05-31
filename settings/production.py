import os

DEBUG = False
ALLOWED_HOSTS = ['56.228.81.228', 'localhost', '127.0.0.1', '*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'crmdb',
        'USER': 'crmadmin',
        'PASSWORD': 'CrmPass2024!',
        'HOST': 'localhost',  # EC2 ning o'zida bo'lgani uchun
        'PORT': '5432',
    }
}

STATIC_ROOT = '/app/staticfiles'
STATIC_URL = f"https://{os.environ.get('S3_BUCKET')}.s3.amazonaws.com/static/"

DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_STORAGE_BUCKET_NAME = os.environ.get('S3_BUCKET')
AWS_DEFAULT_ACL = 'private'