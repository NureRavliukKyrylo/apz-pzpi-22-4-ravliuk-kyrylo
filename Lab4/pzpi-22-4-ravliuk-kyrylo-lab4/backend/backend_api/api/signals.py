from django.db.models.signals import post_save,pre_delete
from django.dispatch import receiver
from django.utils.timezone import now
from backend_api.models import IoTFillingContainer, CustomUser, NotificationsUser, NotificationTypes, StatusOfContainer, StationOfContainers,WasteHistory, CollectionSchedules,StationOfContainersStatus,AdminLoggingChanges,UserSettings,DeviceToken
from django.db.models.signals import pre_save
from django.utils import timezone
from django.core.mail import send_mail
import backend.settings as settings
from django.db.models import Model
from ..middleware import get_current_request,get_user
import json
from django.core.serializers.json import DjangoJSONEncoder
import datetime
from django.db import connection
from .utils.firebase_utils import send_firebase_notification

# Signal to check the container fill level before saving IoTFillingContainer
@receiver(pre_save, sender=IoTFillingContainer)
def check_container_fill_level(sender, instance, **kwargs):
    if instance.pk:
        previous_instance = IoTFillingContainer.objects.get(pk=instance.pk)
        previous_sensor_value = previous_instance.sensor_value
    else:
        previous_sensor_value = None 

    if previous_sensor_value != instance.sensor_value:
        container = instance.container_id_filling
        if container:
            station_name = container.station_id.station_of_containers_name
            container_id = container.id
            container_type = container.type_of_container_id.type_name_container
            formatted_message = f"Container {container_type} on station '{station_name}' must be reserved right now."

            if instance.sensor_value > 90:
                full_status, _ = StatusOfContainer.objects.get_or_create(status_name="Full")
                container.status_container_id = full_status
                container.save()

                operators = CustomUser.objects.filter(role__name="Operator")
                for operator in operators:
                    settings_user = UserSettings.objects.filter(user=operator).first()
                    if not settings_user:
                        continue

                    NotificationsUser.objects.create(
                        user_id=operator,
                        message=formatted_message,
                        notification_type=NotificationTypes.objects.get_or_create(type_notification_name="Extra")[0],
                        timestamp_get_notification=now(),
                        station_id=container.station_id
                    )

                    if settings_user.email_notifications:
                        send_mail(
                            subject="Action Required: Container Reservation",
                            message=formatted_message,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[operator.email],
                            fail_silently=False,
                        )

                    if settings_user.push_notifications:
                        device_token = DeviceToken.objects.filter(user=operator).first()
                        if device_token:
                            send_firebase_notification(
                                token=device_token.token,
                                title="Container Alert",
                                body=formatted_message,
                                data={
                                    "station_name": station_name,
                                    "container_id": str(container_id),
                                    "notification_type": "container_alert"
                                }
                            )

            elif instance.sensor_value <= 90:
                active_status, _ = StatusOfContainer.objects.get_or_create(status_name="Active")
                container.status_container_id = active_status
                container.save()

# Signal to update the last reserved date on status change for StationOfContainers
@receiver(pre_save, sender=StationOfContainers)
def update_last_reserved_on_status_change(sender, instance, **kwargs):
    # If the station's status changes from "Reserving" to "Active", update the last reserved date
    if instance.pk: 
        previous_instance = StationOfContainers.objects.get(pk=instance.pk)
        
        if (previous_instance.status_station.station_status_name == "Reserving" and 
            instance.status_station.station_status_name == "Active"):
            instance.last_reserved = timezone.now() 

# Signal to create a WasteHistory record when a station status changes from "Reserving"
@receiver(pre_save, sender=StationOfContainers)
def create_waste_history_on_status_change(sender, instance, **kwargs):
    
    if instance.pk: 
        previous_instance = StationOfContainers.objects.get(pk=instance.pk)
        
        if (previous_instance.status_station.station_status_name == "Reserving"):
            WasteHistory.objects.create(
                station_id=instance,
                recycling_date=instance.last_reserved,
            )

def get_reserving_status():
    return StationOfContainersStatus.objects.get_or_create(station_status_name="Reserving")[0]

# Signal to update the station's status when a collection schedule is created
@receiver(post_save, sender=CollectionSchedules)
def update_station_status_on_schedule(sender, instance, created, **kwargs):
    if not created:  
        return
    
    # If the schedule's collection date matches today's date, set the station's status to "Reserving"
    if instance.collection_date.date() == timezone.now().date():
        station = instance.station_of_containers_id
        station.status_station = get_reserving_status()
        station.save()

@receiver(pre_save, sender=CollectionSchedules)
def check_collection_date_update(sender, instance, **kwargs):
    if instance.pk:
        previous_instance = CollectionSchedules.objects.get(pk=instance.pk)
        previous_collection_date = previous_instance.collection_date
    else:
        previous_collection_date = None 

    if previous_collection_date != instance.collection_date:
        station = instance.station_of_containers_id
        print(f"Station: {station.station_of_containers_name if station else 'None'}")
        if station:
            customers = CustomUser.objects.filter(role__name="Customer")
            operators = CustomUser.objects.filter(role__name="Operator")

            if customers.exists():
                for customer in customers:
                    
                    settings_user = UserSettings.objects.filter(user=customer).first()
                    if settings_user:
                        print(f"{customer.id} {settings_user.push_notifications}")
                        formatted_collection_date = instance.collection_date.strftime('%Y-%m-%d %H:%M')
                        NotificationsUser.objects.create(
                            user_id=customer,
                            message=f"The collection date for station '{station.station_of_containers_name}' has been updated to {formatted_collection_date}.",
                            notification_type=NotificationTypes.objects.get_or_create(type_notification_name="Schedule Update")[0],
                            timestamp_get_notification=now(),
                            station_id=station
                        )

                        if settings_user.email_notifications:
                            send_mail(
                                subject="Collection Date Updated for Station",
                                message=f"The collection date for station '{station.station_of_containers_name}' has been updated to {formatted_collection_date}.",
                                from_email=settings.DEFAULT_FROM_EMAIL,
                                recipient_list=[customer.email],
                                fail_silently=False,
                            )
                            print(settings.DEFAULT_FROM_EMAIL)
                        if settings_user.push_notifications:
                            print(f"➡ Sending push to {customer.id}")
                            device_token = DeviceToken.objects.filter(user=customer).first()
                            if device_token:
                                send_firebase_notification(
                                    token=device_token.token,
                                    title="Collection Date Updated",
                                    body=f"The collection date for station '{station.station_of_containers_name}' has been updated to {formatted_collection_date}.",
                                    data={
                                        "station_name": station.station_of_containers_name,
                                        "collection_date": formatted_collection_date,
                                    }
                                )

            if operators.exists():
                for operator in operators:
                    settings_user = UserSettings.objects.filter(user=operator).first()
                    if settings_user:
                        formatted_collection_date = instance.collection_date.strftime('%Y-%m-%d %H:%M')
                        NotificationsUser.objects.create(
                            user_id=operator,
                            message=f"Operator notification: The collection date for station '{station.station_of_containers_name}' has been updated to {formatted_collection_date}.",
                            notification_type=NotificationTypes.objects.get_or_create(type_notification_name="Schedule Update")[0],
                            timestamp_get_notification=now(),
                            station_id=station
                        )

                        if settings_user.email_notifications:
                            send_mail(
                                subject="Collection Date Updated for Station (Operator)",
                                message=f"Operator notification: The collection date for station '{station.station_of_containers_name}' has been updated to {formatted_collection_date}.",
                                from_email=settings.DEFAULT_FROM_EMAIL,
                                recipient_list=[operator.email],
                                fail_silently=False,
                            )

                        if settings_user.push_notifications:
                            device_token = DeviceToken.objects.filter(user=operator).first()
                            if device_token:
                                send_firebase_notification(
                                    token=device_token.token,
                                    title="Collection Date Updated",
                                    body=f"The collection date for station '{station.station_of_containers_name}' has been updated to {formatted_collection_date}.",
                                    data={
                                        "station_name": station.station_of_containers_name,
                                        "collection_date": formatted_collection_date,
                                    }
                                )

# Helper function to serialize an instance into a dictionary (useful for logging changes)
def serialize_instance(instance):
    if instance is None:
        return None

    data = {}
    for field in instance._meta.fields:
        value = getattr(instance, field.name)

        if isinstance(value, datetime.datetime):
            data[field.name] = value.isoformat()  
        elif isinstance(value, Model): 
            data[field.name] = serialize_instance(value)
        else:
            data[field.name] = value
    return data

# Function to log changes made to models for audit purposes
def log_change(user, table_name, action, values):
    if AdminLoggingChanges._meta.db_table in connection.introspection.table_names():
        for key, value in values.items():
            if isinstance(value, Model):
                values[key] = serialize_instance(value)
            elif isinstance(value, datetime.datetime):
                values[key] = value.isoformat()

        json.dumps(values, cls=DjangoJSONEncoder) 

        AdminLoggingChanges.objects.create(
            user=user,
            table_name=table_name,
            action=action,
            timestamp=timezone.now(),
            values=values
        )

# Signal to log changes made to models (create or update actions)
@receiver(post_save)
def log_model_changes(sender, instance, created, **kwargs):
        if sender == AdminLoggingChanges:
            return

        current_request = get_current_request()
        user = get_user(current_request)
        action = 'CREATE' if created else 'UPDATE'

        changes = {field.name: getattr(instance, field.name) for field in instance._meta.fields}
        log_change(user, sender._meta.model_name, action, changes)

# Signal to log model deletions (delete actions)
@receiver(pre_delete)
def log_model_deletion(sender, instance, **kwargs):
    if sender == AdminLoggingChanges:
        return

    current_request = get_current_request()
    user = get_user(current_request)
    action = 'DELETE'

    changes = {field.name: getattr(instance, field.name) for field in instance._meta.fields}
    log_change(user, sender._meta.model_name, action, changes)

