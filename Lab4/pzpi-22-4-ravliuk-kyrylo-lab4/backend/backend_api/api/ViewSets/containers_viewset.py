from backend_api.api.ViewSets.base_viewset import GenericViewSet,StandardResultsSetPagination
from rest_framework.response import Response
from rest_framework.decorators import action
from drf_yasg.utils import swagger_auto_schema
from backend_api.api.permissions import IsAdminAuthenticated,IsAdminOrOperatorAuthenticated,IsAuthenticated,IsAdminOrOperatorOrUserAuthenticated
from ..serializers import ContainersSerializer
from ...models import Containers
from rest_framework.response import Response
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg import openapi
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework import viewsets
from rest_framework.mixins import ListModelMixin

class ContainersViewSet(ListModelMixin,viewsets.GenericViewSet,GenericViewSet):
    queryset = Containers.objects.all()
    serializer_class = ContainersSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter] 
    filterset_fields = ['status_container_id__status_name', 'type_of_container_id__type_name_container']
    search_fields = ['station_id__station_of_containers_name']
    pagination_class = StandardResultsSetPagination

    ordering_fields = ['last_updated'] 
    ordering = ['-last_updated']

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            permission_classes = [IsAdminOrOperatorOrUserAuthenticated]
        else:
            permission_classes = [IsAdminAuthenticated]
        return [permission() for permission in permission_classes]
    
    @swagger_auto_schema(
        operation_description="Create a new Container",
        request_body=ContainersSerializer,
        responses={201: ContainersSerializer}
    )
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(self.format_error(serializer.errors), status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="List all Containers with filtering options",
        manual_parameters=[
            openapi.Parameter(
                'status_container_id__status_name',
                openapi.IN_QUERY,
                description="Filter containers by status name (e.g., 'Active')",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'type_of_container_id__type_name_container',
                openapi.IN_QUERY,
                description="Filter containers by type name (e.g., 'Plastic')",
                type=openapi.TYPE_STRING
            ),
            
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Search containers by Station",
                type=openapi.TYPE_STRING
            ),
        ],
        responses={200: ContainersSerializer(many=True)}
    )
    def list(self, request):
        queryset = self.queryset

        queryset = self.apply_filters(request, queryset)
        queryset = self.apply_search(request, queryset)

        ordering_backend = OrderingFilter()
        queryset = ordering_backend.filter_queryset(request, queryset, self)
        
        if 'page' in request.query_params:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.serializer_class(page, many=True)
                return self.get_paginated_response(serializer.data)
            
        queryset = self.queryset.all()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    # apply filters for searching containers
    def apply_filters(self, request, queryset):
        filter_backend = DjangoFilterBackend()
        return filter_backend.filter_queryset(request, queryset, self)
    
    def apply_search(self, request, queryset):
        search_backend = SearchFilter()
        return search_backend.filter_queryset(request, queryset, self)
    
    @swagger_auto_schema(
        operation_description="Update container",
        request_body=ContainersSerializer,
        responses={201: ContainersSerializer}
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
            return Response({"error": f"A Container with ID {pk} does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
    # Custom action to partially update the status of a container
    @action(detail=True, methods=['patch'], url_path='update-status')
    @swagger_auto_schema(
        operation_description="Partially update the status of a container",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'status_container_id': openapi.Schema(type=openapi.TYPE_INTEGER, description="ID of the new status")
            },
            required=['status_container_id']
        ),
        responses={200: ContainersSerializer}
    )
    def partial_update_status(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
            new_status_id = request.data.get('status_container_id')

            if not new_status_id:
                return Response({"error": "Missing 'status_container_id' in request data"}, status=status.HTTP_400_BAD_REQUEST)

            instance.status_container_id_id = new_status_id  # Update the FK directly
            instance.save()
            
            return Response(self.serializer_class(instance).data, status=status.HTTP_200_OK)
        except Containers.DoesNotExist:
            return Response({"error": f"A Container with ID {pk} does not exist."}, status=status.HTTP_404_NOT_FOUND)

    # Custom action to partially update the type of a container
    @action(detail=True, methods=['patch'], url_path='update-type')
    @swagger_auto_schema(
        operation_description="Partially update the type of a container",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'type_of_container_id': openapi.Schema(type=openapi.TYPE_INTEGER, description="ID of the new type")
            },
            required=['type_of_container_id']
        ),
        responses={200: ContainersSerializer}
    )
    def partial_update_type(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
            new_type_id = request.data.get('type_of_container_id')

            if not new_type_id:
                return Response({"error": "Missing 'type_of_container_id' in request data"}, status=status.HTTP_400_BAD_REQUEST)

            instance.type_of_container_id_id = new_type_id 
            instance.save()

            return Response(self.serializer_class(instance).data, status=status.HTTP_200_OK)
        except Containers.DoesNotExist:
            return Response({"error": f"A Container with ID {pk} does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
    