from backend_api.api.ViewSets.base_viewset import GenericViewSet,StandardResultsSetPagination
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from backend_api.api.permissions import IsAdminAuthenticated, IsAdminOrOperatorOrUserAuthenticated
from ..serializers import IoTFillingContainerSerializer,SensorValueUpdateSerializer
from ...models import IoTFillingContainer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from rest_framework import viewsets
from rest_framework.mixins import ListModelMixin
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

class IoTFillingContainerViewSet(ListModelMixin,viewsets.GenericViewSet,GenericViewSet):
    queryset = IoTFillingContainer.objects.all()
    serializer_class = IoTFillingContainerSerializer
    
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['container_id_filling__type_of_container_id__type_name_container']
    search_fields = ['container_id_filling__station_id__station_of_containers_name']
    pagination_class = StandardResultsSetPagination
    ordering_fields = ['time_of_detect'] 
    ordering = ['-time_of_detect']

    def get_permissions(self):
        if self.action == 'list' or self.action == 'retrieve':
            permission_classes = [IsAdminOrOperatorOrUserAuthenticated]
        else:
            permission_classes = [IsAdminAuthenticated]
        return [permission() for permission in permission_classes]
    
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

        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)
    
    def apply_filters(self, request, queryset):
        filter_backend = DjangoFilterBackend()
        return filter_backend.filter_queryset(request, queryset, self)

    def apply_search(self, request, queryset):
        search_backend = SearchFilter()
        return search_backend.filter_queryset(request, queryset, self)

    @swagger_auto_schema(
        operation_description="Create a new Filling level",
        request_body=IoTFillingContainerSerializer,
        responses={201: IoTFillingContainerSerializer}
    )
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(self.format_error(serializer.errors), status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
        operation_description="Update a new Filling level",
        request_body=IoTFillingContainerSerializer,
        responses={201: IoTFillingContainerSerializer}
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
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)\
    
    # Custom action to change the sensor-value for sensor
    @action(detail=True, methods=['patch'], url_path='sensor-value-update')
    @swagger_auto_schema(
        operation_description="Update sensor value of a filling container (partial update, only 'sensor_value' field allowed)",
        request_body=SensorValueUpdateSerializer,
        responses={200: IoTFillingContainerSerializer}
    )
    def sensor_value_change(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
        except IoTFillingContainer.DoesNotExist:
            return Response({"error": f"A Filling sensor with ID {pk} does not exist."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SensorValueUpdateSerializer(instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(IoTFillingContainerSerializer(instance).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)