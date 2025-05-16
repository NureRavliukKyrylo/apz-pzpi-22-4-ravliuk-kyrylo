from backend_api.api.ViewSets.base_viewset import GenericViewSet,StandardResultsSetPagination
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from backend_api.api.permissions import IsAdminAuthenticated,IsUserAuthenticated,IsAuthenticated,IsAdminOrUserAutheticated,IsAdminOrOperatorOrUserAuthenticated
from ..serializers import CustomerSerializer,PasswordUpdateSerializer,CustomerUpdateSerializer,UpdateRoleSerializer
from ...models import CustomUser
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.decorators import permission_classes
from ...middleware import get_user
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg import openapi
from rest_framework import mixins
from rest_framework import viewsets
from rest_framework.mixins import ListModelMixin

class CustomerViewSet(ListModelMixin,viewsets.GenericViewSet,GenericViewSet):

    queryset = CustomUser.objects.all()
    serializer_class = CustomerSerializer
    pagination_class = StandardResultsSetPagination

    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['role__name']
    search_fields = ['username']
    
    def get_permissions(self):
        if self.action == 'update' or self.action == 'change_password' or self.action == 'myself' or self.action == 'retrieve':
            permission_classes = [IsAdminOrOperatorOrUserAuthenticated]
        else:
            permission_classes = [IsAdminAuthenticated]
        return [permission() for permission in permission_classes]
    
    @swagger_auto_schema(
        operation_description="List all Customers with filtering by role and search by username",
        manual_parameters=[
            openapi.Parameter(
                'role__name',
                openapi.IN_QUERY,
                description="Filter customers by role name (e.g., 'Admin')",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'search',
                openapi.IN_QUERY,
                description="Search customers by username",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
    'page',
    openapi.IN_QUERY,
    description="Page number (starts from 1)",
    type=openapi.TYPE_INTEGER
)
        ],
        responses={200: CustomerSerializer(many=True)}
    )
    def list(self, request):
        queryset = self.queryset

        queryset = self.apply_filters(request, queryset)
        queryset = self.apply_search(request, queryset)

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
        operation_description="Create a new customer",
        request_body=CustomerSerializer,
        responses={201: CustomerSerializer}
    )
    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(self.format_error(serializer.errors), status=status.HTTP_400_BAD_REQUEST)
    
    @swagger_auto_schema(
    operation_description="Update a customer without modifying the password",
    request_body=CustomerUpdateSerializer,
    responses={200: CustomerSerializer}
    )
    def update(self, request, pk=None):
        print(f"Received data for user update: {request.data}")
        user_id_from_token = get_user(request)

        print(f"Authenticated user ID: {user_id_from_token.id}")

        if str(user_id_from_token.id) != pk:
            return Response({"error": "You do not have permission to change this password."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            instance = self.queryset.get(pk=pk)
            serializer = self.serializer_class(instance, data=request.data, partial=True) 
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except self.queryset.model.DoesNotExist:
            return Response({"error": f"A Customer with ID {pk} does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
    # Custom action to change the password for a customer
    @action(detail=True, methods=['patch'], url_path='change-password')
    @swagger_auto_schema(
        operation_description="Change password for a customer",
        request_body=PasswordUpdateSerializer,
        responses={200: "Password updated successfully", 400: "Invalid input"}
    )
    def change_password(self, request, pk=None):
        # Retrieve the authenticated user from the request to check if for this user changing password
        user_id_from_token = get_user(request)

        print(f"Authenticated user ID: {user_id_from_token.id}")

        if str(user_id_from_token.id) != pk:
            return Response({"error": "You do not have permission to change this password."}, status=status.HTTP_403_FORBIDDEN)

        try:
            instance = self.queryset.get(pk=pk)

            serializer = PasswordUpdateSerializer(
                data=request.data,
                context={'user': instance}
            )

            if serializer.is_valid():
                serializer.update(instance, serializer.validated_data)
                return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except self.queryset.model.DoesNotExist:

            return Response({"error": f"A Customer with ID {pk} does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
    # Custom action to update the role of a customer (only accessible by admins)
    @action(detail=True, methods=['patch'], url_path='update-role')
    @swagger_auto_schema(
        operation_description="Change Role for a customer",
        request_body=UpdateRoleSerializer,
        responses={200: "Role updated successfully", 400: "Invalid input"}
    )
    @permission_classes([IsAdminAuthenticated])
    def update_role(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
            user_role= request.data.get('role')

            if not user_role:
                return Response({"error": "Missing 'role' in request data"}, status=status.HTTP_400_BAD_REQUEST)

            instance.role_id= user_role
            instance.save()
            
            return Response(self.serializer_class(instance).data, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": f"A User with ID {pk} does not exist."}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'], url_path='myself')
    @swagger_auto_schema(
    operation_description="Get info about myself",
    responses={200: CustomerSerializer}
)
    @permission_classes([IsAdminAuthenticated])
    def myself(self, request):
        user = get_user(request)
        if not user:
            return Response({"error": "Authentication credentials were not provided or are invalid."}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = self.serializer_class(user)
        return Response(serializer.data, status=status.HTTP_200_OK)