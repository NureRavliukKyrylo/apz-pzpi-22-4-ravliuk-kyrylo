from django.http import HttpResponse, JsonResponse
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.parsers import MultiPartParser
from django.db import transaction
from django.db.utils import IntegrityError
from rest_framework import status
from django.apps import apps
from django.db.models.signals import pre_save, post_save
from django.db.models.signals import pre_delete, post_delete
from contextlib import contextmanager
from django.db import connection
from datetime import datetime
from cryptography.fernet import Fernet
from cryptography.fernet import InvalidToken
from backend_api.api.permissions import IsAdminAuthenticated
import backend.settings as settings

ENCRYPTION_KEY = settings.ENCRYPTION_KEY
fernet = Fernet(ENCRYPTION_KEY)

def encrypt_data(plain_text: str) -> bytes:
    return fernet.encrypt(plain_text.encode())

def decrypt_data(encrypted_data: bytes) -> str:
    return fernet.decrypt(encrypted_data).decode()


# Custom JSON serializer to handle datetime objects
def custom_json_serializer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()  
    raise TypeError(f"Type {type(obj)} not serializable")

# View to download a backup of specified models' data
class DownloadBackupView(APIView):
    permission_classes = [IsAdminAuthenticated]
    @swagger_auto_schema(
        operation_summary="Download database backup",
        operation_description=(
            "This endpoint generates a JSON backup of the specified models' data in the database. "
            "The response will be a downloadable JSON file."
        ),
        responses={
            200: openapi.Response(
                description="Backup file generated successfully",
                examples={
                    "application/json": {
                        "message": "JSON file downloaded successfully."
                    }
                }
            ),
            404: openapi.Response(
                description="No data available for backup.",
                examples={
                    "application/json": {
                        "message": "No data available for backup."
                    }
                }
            ),
            500: openapi.Response(
                description="Unexpected error",
                examples={
                    "application/json": {
                        "error": "An error occurred: <error message>"
                    }
                }
            ),
        }
    )
    def post(self, request, *args, **kwargs):
        models_to_load = [  # List of models to back up
            "backend_api.roleuser",
            "backend_api.StationOfContainersStatus",
            "backend_api.NotificationTypes",
            "backend_api.StatusOfContainer",
            "backend_api.TypeOfContainer",
            "backend_api.customuser",
            "backend_api.StationOfContainers",
            "backend_api.CollectionSchedules",
            "backend_api.NotificationsUser",
            "backend_api.Containers",
            "backend_api.IoTFillingContainer",
            "backend_api.WasteHistory",
            "backend_api.AdminLoggingChanges",
            "backend_api.UserSettings",
            "backend_api.DeviceToken",
        ]
        
        try:
            backup_data = {}

            # Loop over models and retrieve their data
            for model_path in models_to_load:
                if "." not in model_path:
                    backup_data[model_path] = "Invalid model format. Expected '<app_label>.<model_name>'."
                    continue

                try:
                    app_label, model_name = model_path.split(".")
                    model = apps.get_model(app_label, model_name)
                    model_data = list(model.objects.all().values())  
                    backup_data[model_path] = model_data
                except LookupError:
                    backup_data[model_path] = f"Model {model_path} not found."
            
             # Check if backup data is available
            if not any(isinstance(v, list) and v for v in backup_data.values()):
                return Response({"message": "No data available for backup."}, status=status.HTTP_404_NOT_FOUND)

            json_data = json.dumps(backup_data, default=custom_json_serializer)
            encrypted_data = encrypt_data(json_data)

            response = HttpResponse(encrypted_data, content_type="application/octet-stream")
            response['Content-Disposition'] = 'attachment; filename="models_backup.json"'
            return response

        except Exception as e:
            return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)

# Context manager to temporarily disable database signals
@contextmanager
def disable_all_signals():
    signals_to_disconnect = [pre_save, post_save, pre_delete, post_delete]
    disconnected_signals = {}

    for signal in signals_to_disconnect:
        disconnected_signals[signal] = signal.receivers[:]
        signal.receivers.clear()

    try:
        yield
    finally:
        for signal, receivers in disconnected_signals.items():
            signal.receivers.extend(receivers)

# View to restore data from a JSON backup file
class RestoreBackupView(APIView):
    parser_classes = [MultiPartParser]

    @swagger_auto_schema(
        operation_summary="Restore database backup",
        operation_description="Restores data to the database from a JSON backup file. The file should be in the same format as the backup data.",
        manual_parameters=[
            openapi.Parameter(
                name="file",
                in_=openapi.IN_FORM,
                type=openapi.TYPE_FILE,
                required=True,
                description="JSON backup file to restore data"
            )
        ],
        responses={
            200: openapi.Response(
                description="Data restored successfully",
                examples={
                    "application/json": {
                        "message": "Data restored successfully."
                    }
                }
            ),
            400: openapi.Response(
                description="Invalid backup data",
                examples={
                    "application/json": {
                        "error": "Invalid data format."
                    }
                }
            ),
            500: openapi.Response(
                description="Unexpected error",
                examples={
                    "application/json": {
                        "error": "An error occurred: <error message>"
                    }
                }
            ),
        }
    )
    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return JsonResponse({"error": "No file provided."}, status=400)
        
        encrypted_content = file.read()

        try:
            decrypted_json = decrypt_data(encrypted_content)
            backup_data = json.loads(decrypted_json)  # Load backup data from file
        except InvalidToken:
            return JsonResponse({"error": "Decryption failed: invalid encryption key or corrupted data."}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)

        with disable_all_signals(): # Disable signals to prevent unintended side effects
            try:
                errors = []
                for model_path, records in backup_data.items():
                    if not isinstance(records, list):
                        errors.append(f"Data for {model_path} is not a list.")
                        continue

                    try:
                        app_label, model_name = model_path.split(".")
                        model = apps.get_model(app_label, model_name)
                    except (ValueError, LookupError):
                        errors.append(f"Invalid model path: {model_path}")
                        continue

                    with transaction.atomic():
                        for record in records:
                            try:
                                obj, created = model.objects.update_or_create(
                                    id=record.get("id"), defaults=record    # Restore or update record
                                )
                            except IntegrityError as e:
                                errors.append(
                                    f"Integrity error for {model_path} with ID {record.get('id')}: {str(e)}"
                                )
                                continue

                        self.update_sequence_for_model(model)

                if errors:
                    return JsonResponse({"message": "Partial restore completed.", "errors": errors}, status=400)

                return JsonResponse({"message": "Data restored successfully."}, status=200)

            except Exception as e:
                return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)

    def update_sequence_for_model(self, model):
        table_name = model._meta.db_table
        pk_name = model._meta.pk.column

        # Update the sequence for auto-increment fields
        with connection.cursor() as cursor:
            cursor.execute(f"SELECT MAX({pk_name}) FROM {table_name}")
            max_id = cursor.fetchone()[0] or 0

            sequence_name = f"{table_name}_{pk_name}_seq"
            cursor.execute(f"SELECT setval('{sequence_name}', %s)", [max_id + 1])