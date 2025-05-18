import requests
from google.oauth2 import service_account
import google.auth.transport.requests
import backend.settings as settings

def get_bearer_token():
    credentials = service_account.Credentials.from_service_account_info(
        settings.SERVICE_ACCOUNT_INFO,
        scopes=['https://www.googleapis.com/auth/firebase.messaging']
    )
    request = google.auth.transport.requests.Request()
    credentials.refresh(request)
    return credentials.token

def send_firebase_notification(token, title, body, data=None):
    url = f"https://fcm.googleapis.com/v1/projects/{settings.SERVICE_ACCOUNT_INFO['project_id']}/messages:send"
    headers = {
        "Authorization": f"Bearer {get_bearer_token()}",
        "Content-Type": "application/json"
    }
    message = {
        "token": token,
        "notification": {
            "title": title,
            "body": body,
        }
    }
    if data:
        message["data"] = data

    payload = {"message": message}

    response = requests.post(url, headers=headers, json=payload)
    response.raise_for_status() 
    return response.json()