from django.urls import path
from .views import *
from .serializers import *
from .models import *

urlpatterns = [
    path('register/', UserView.as_view(), name = 'register'),
    path('login/', LoginView.as_view(), name = 'login'),
    path('logout/', LogoutView.as_view(), name = 'logout'),
    path('change_password/', ChangePasswordView.as_view(), name = 'change_password'),
    path('refresh/', RefreshTokenView.as_view(), name = 'refresh'),
    path('dashboard/', Dashboard.as_view(), name = 'dashboard'),
    path('otp_generate/', GenerateOTPView.as_view(), name = 'generate_otp'),
    path('verify_otp/', VerifyOTPView.as_view(), name = 'verify_otp'),
    path('task_status/', TaskStatusView.as_view(), name = 'task_status'),
]