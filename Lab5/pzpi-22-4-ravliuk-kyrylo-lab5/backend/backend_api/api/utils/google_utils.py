import secrets
import string
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import backend.settings as settings

def verify_google_token(id_token_str):
    try:
        CLIENT_ID = settings.GOOGLE_CLIENT_ID
        id_info = id_token.verify_oauth2_token(id_token_str, google_requests.Request(), CLIENT_ID)

        return id_info
    except ValueError as e:
        raise Exception(f"Invalid token: {e}")

def generate_secure_password(length=12):
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(characters) for _ in range(length))