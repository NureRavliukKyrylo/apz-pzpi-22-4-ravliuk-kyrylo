from rest_framework.views import APIView
from rest_framework.response import Response
from ...models import UserSettings,DeviceToken
from ...middleware import get_user
from backend_api.api.permissions import IsAuthenticated
from ..serializers import DeviceTokenSerializer
from rest_framework import status

class ToggleEmailNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = get_user(request)
        settings, created = UserSettings.objects.get_or_create(user=user)
        settings.email_notifications = not settings.email_notifications
        settings.save()
        return Response({"email_notifications": settings.email_notifications})

class TogglePushNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = get_user(request)
        settings, created = UserSettings.objects.get_or_create(user=user)
        settings.push_notifications = not settings.push_notifications
        settings.save()
        return Response({"push_notifications": settings.push_notifications})

class UserSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = get_user(request)
        settings, created = UserSettings.objects.get_or_create(user=user)
        return Response({
            "email_notifications": settings.email_notifications,
            "push_notifications": settings.push_notifications
        })

class RegisterDeviceTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("Received data:", request.data)
        serializer = DeviceTokenSerializer(data=request.data)
        
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=400)
        
        token = serializer.validated_data['token']
        DeviceToken.objects.update_or_create(
            user=request.user,
            defaults={'token': token}
        )
        return Response({'message': 'Token registered'}, status=200)