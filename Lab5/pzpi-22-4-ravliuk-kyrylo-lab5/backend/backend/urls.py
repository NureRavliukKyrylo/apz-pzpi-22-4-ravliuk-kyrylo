from django.contrib import admin
from django.urls import path,include
from rest_framework_simplejwt.views import TokenRefreshView
from backend_api.api.Views.auth_views import RegisterCustomerView,LoginCustomerView, LogoutCustomerView,GoogleLoginCustomerView,CheckAdminStatusView
from backend_api.api.Views.report_views import GetReportOfStationsView,GetReportOfContainersView
from backend_api.api.Views.db_managment_views import DownloadBackupView,RestoreBackupView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from backend_api.api.Views.user_settings_view import ToggleEmailNotificationsView,TogglePushNotificationsView,UserSettingsView,RegisterDeviceTokenView
from django.views.decorators.csrf import csrf_exempt

schema_view = get_schema_view(
    openapi.Info(
        title="CollectionGarbageSystem API",
        default_version='v1',
        description="Test For Task2",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@yourdomain.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path('api/', include('backend.api.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register', RegisterCustomerView.as_view(), name='register_user'),
    path('api/login', csrf_exempt(LoginCustomerView.as_view()), name='login_user'),
    path('api/logout', LogoutCustomerView.as_view(), name='logout_user'),
    path('api/get_report',GetReportOfStationsView.as_view(),name = "report"),
    path('api/get_report_waste',GetReportOfContainersView.as_view(),name = "report"),
    path('api/back-up',DownloadBackupView.as_view(),name = "back_up"),
    path('api/restore-DB',RestoreBackupView.as_view(),name = "restore_db"),
    path('api/toggle-email/',ToggleEmailNotificationsView.as_view(),name = "toogle_email"),
    path('api/toggle-push/',TogglePushNotificationsView.as_view(),name = "toogle_email"),
    path('api/user-settings/',UserSettingsView.as_view(),name = "user_settings"),
    path('api/register-token/', RegisterDeviceTokenView.as_view(), name='register-device-token'),
    path('api/login-google/', GoogleLoginCustomerView.as_view(), name='google-login'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/check-admin/', CheckAdminStatusView.as_view(), name='check-admin'),

]