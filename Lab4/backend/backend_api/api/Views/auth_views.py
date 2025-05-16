from django.http import JsonResponse
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from backend_api.api.serializers import MyTokenObtainPairSerializer,RegisterCustomerSerializer,LoginCustomerSerializer,CustomerSerializer
from ...models import CustomUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
import backend.settings as settings
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.mail import send_mail
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from ...middleware import get_user_from_token
from ..utils.google_utils import *
from django.views.decorators.csrf import ensure_csrf_cookie

# View to register a new customer
class RegisterCustomerView(APIView):
    @swagger_auto_schema(
        request_body=RegisterCustomerSerializer,
        responses={
            201: 'User registered successfully',
            400: 'Invalid input',
        }
    )
    def post(self, request):
        serializer = RegisterCustomerSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            csrf_token = get_token(request)

            response = Response({"message": "User registered successfully."}, status=status.HTTP_201_CREATED)

            secure = not settings.DEBUG  

            response.set_cookie('access_token', access_token, httponly=True, secure=secure, max_age=3600, path='/')
            response.set_cookie('refresh_token', refresh_token, httponly=True, secure=secure, max_age=86400, path='/')
            response.set_cookie('csrftoken', csrf_token, httponly=False, secure=secure, max_age=86400, path='/')

            return response
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

@method_decorator(csrf_exempt, name='dispatch')
class LoginCustomerView(APIView):
    @swagger_auto_schema(
        request_body=LoginCustomerSerializer,
        responses={
            200: 'Login successful',
            400: 'Invalid login credentials',
            500: 'An error occurred',
        }
    )
    def post(self, request):
        serializer = LoginCustomerSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            try:
                user = CustomUser.objects.get(username=username)

                if not check_password(password, user.password):
                    raise AuthenticationFailed('Invalid login credentials')

                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)

                csrf_token = get_token(request)

                user_serializer = CustomerSerializer(user)

                response_data = {
                    'message': 'Login successful',
                    'user': user_serializer.data,
                    'access_token': access_token,
                    'csrf_token' : csrf_token
                }
                response = Response(response_data, status=200)

                secure = not settings.DEBUG 

                response.set_cookie(
                    'access_token',
                    access_token,
                    httponly=False,
                    secure=True, 
                    max_age=3600,
                    path='/',
                    samesite='None'
            )
                response.set_cookie('refresh_token', refresh_token, httponly=False, secure=secure, max_age=86400, path='/')

                return response

            except CustomUser.DoesNotExist:
                raise AuthenticationFailed('Invalid login credentials')

        return Response(serializer.errors, status=400)

# View to logout a customer
class LogoutCustomerView(APIView):

    @swagger_auto_schema(
            operation_description="Logs out the user by deleting the access and refresh tokens from the cookies.",
            responses={
                200: openapi.Response(
                    description="Logout successful",
                    schema=openapi.Schema(type=openapi.TYPE_OBJECT, properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING, example='Logout successful')
                    })
                ),
                403: 'Permission denied - User must be authenticated.',
                500: 'Unexpected error occurred'
            }
        )
    def post(self, request):
        try:
            response = JsonResponse({'message': 'Logout successful'}, status=200)
            
            response.delete_cookie('access_token', path='/')
            response.delete_cookie('refresh_token', path='/')

            return response
        
        except Exception as e:
            return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)

class GoogleLoginCustomerView(APIView):
    @swagger_auto_schema(
        request_body=LoginCustomerSerializer,
        responses={ 
            200: 'Login successful',
            400: 'Invalid login credentials',
            500: 'An error occurred',
        }
    )
    def post(self, request):
        google_token = request.data.get('google_token')

        if not google_token:
            raise AuthenticationFailed('Google token is required')

        try:
            user_info = verify_google_token(google_token)
            email = user_info['email']
            print(user_info)
            user, created = CustomUser.objects.get_or_create(email=email)

            temp_password = generate_secure_password()

            if created:
                user.username = email.split('@')[0]
                user.set_password(temp_password)
                user.save()
                formatted_message = f"""
                Welcome, {user.username}!

                Your temporary password is: {temp_password}

                Please log in and change your password as soon as possible.
                """

                send_mail(
                    subject="Your Temporary Password",
                    message=formatted_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            csrf_token = get_token(request)

            response = Response({'message': 'Login successful'}, status=200)

            secure = not settings.DEBUG

            response.set_cookie('access_token', access_token, httponly=True, secure=secure, max_age=3600, path='/')
            response.set_cookie('refresh_token', refresh_token, httponly=True, secure=secure, max_age=86400, path='/')
            response.set_cookie('csrftoken', csrf_token, httponly=False, secure=secure, max_age=86400, path='/')

            return response

        except Exception as e:
            raise AuthenticationFailed(f"Authentication failed: {str(e)}")

class CheckAdminStatusView(APIView):
    def get(self, request):
        try:
            user = get_user_from_token(request)
        except AuthenticationFailed as e:
            return Response({'detail': str(e)}, status=401)

        if user.role.name != 'Admin':
            raise PermissionDenied('You are not an admin.')

        return Response({'isAdmin': True})