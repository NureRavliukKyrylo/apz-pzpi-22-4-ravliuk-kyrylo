from backend_api.api.ViewSets.base_viewset import GenericViewSet,StandardResultsSetPagination
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from backend_api.api.permissions import IsAdminAuthenticated, IsAdminOrOperatorOrUserAuthenticated
from ..serializers import StationOfContainersStatusSerializer
from ...models import StationOfContainersStatus
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.mixins import ListModelMixin

class StationOfContainersStatusViewSet(ListModelMixin, viewsets.GenericViewSet,GenericViewSet):
    queryset = StationOfContainersStatus.objects.all()
    serializer_class = StationOfContainersStatusSerializer
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            permission_classes = [IsAdminOrOperatorOrUserAuthenticated]
        else:
            permission_classes = [IsAdminAuthenticated]
        return [permission() for permission in permission_classes]
    
    def list(self, request):
        queryset = self.queryset

        if 'page' in request.query_params:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.serializer_class(page, many=True)
                return self.get_paginated_response(serializer.data)
            
        queryset = self.queryset.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Create a new Station Status",
        request_body=StationOfContainersStatusSerializer,
        responses={201: StationOfContainersStatusSerializer}
        )
    
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(self.format_error(serializer.errors), status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Update a Station Status",
        request_body=StationOfContainersStatusSerializer,
        responses={201: StationOfContainersStatusSerializer}
        )
    def update(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
            serializer = self.serializer_class(instance, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(self.format_error(serializer.errors), status=status.HTTP_400_BAD_REQUEST)
        except self.queryset.model.DoesNotExist:
            return Response({"error": f"A Station Status with ID {pk} does not exist."}, status=status.HTTP_404_NOT_FOUND)