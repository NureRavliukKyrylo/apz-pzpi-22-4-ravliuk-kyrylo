from rest_framework.viewsets import ReadOnlyModelViewSet

from backend_api.api.permissions import IsAdminAuthenticated
from ...models import AdminLoggingChanges
from ..serializers import AdminLoggingChangesSerializer

class AdminLoggingChangesViewSet(ReadOnlyModelViewSet):
    queryset = AdminLoggingChanges.objects.all()
    serializer_class = AdminLoggingChangesSerializer

    def get_permissions(self):
        permission_classes = [IsAdminAuthenticated]
        return [permission() for permission in permission_classes]
    
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)