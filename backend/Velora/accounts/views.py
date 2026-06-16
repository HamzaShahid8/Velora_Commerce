from django.shortcuts import render
from .serializers import *
from .models import *
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework import generics
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from .tasks import *
import json
from django.http import JsonResponse
from celery.result import AsyncResult
from drf_spectacular.utils import extend_schema
from activity_logs.models import *
from activity_logs.utils import *
from activity_logs.serializers import *
from activity_logs.views import *

# Create your views here.

class UserView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
    def perform_create(self, serializer):
        user = serializer.save()

        otp_obj = OTP.objects.create(email=user.email)

        send_otp_email.delay(otp_obj.id)
    
@extend_schema(             # manual schema required
    request = LoginSerializer,
    responses = {200, dict}
)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=400)
        
        create_log(
            user=user,
            action='login',
        )

        refresh_token = RefreshToken.for_user(user)
        access_token = refresh_token.access_token
        
        response = Response({
            'message': 'Login successfully',
            'user': {
                'user': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role.name if user.role else None,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }
        }, status=200)
        
        response.set_cookie(
            key = 'access_token',
            value = access_token,
            httponly = True,
            secure = False,
            samesite = 'lax',
            path = '/'
        )
        
        response.set_cookie(
            key = 'refresh_token',
            value = str(refresh_token),
            httponly = True,
            secure = False,
            samesite = 'lax',
            path = '/'
        )
        return response
    
class GenerateOTPView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get('email')

        otp_obj = OTP.objects.create(
            email=email
        )

        task = send_otp_email.delay(
            otp_obj.id
        )

        return Response({
            'message': 'OTP Generated and Email Sent',
            'task_id': task.id,
            'otp_id': otp_obj.id
        })

class VerifyOTPView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get('email')
        otp = request.data.get('otp')

        try:

            otp_obj = OTP.objects.filter(email=email, otp=otp, is_verified=False).latest('created_at')

            otp_obj.is_verified = True
            otp_obj.save()

            return Response({
                'message': 'OTP Verified Successfully'
            })

        except OTP.DoesNotExist:

            return Response({
                'error': 'Invalid OTP or Email'
            }, status=400)

class TaskStatusView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, task_id):

        result = AsyncResult(task_id)

        return Response({
            'task_id': task_id,
            'status': result.status,
            'result': str(result.result)
        })
    
class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        try:
            if not refresh_token:
                return Response({
                    'message': 'Refresh Token is missing'
                }, status = 400)
            
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
        
            response = Response({
                'message': 'Refresh Token refreshed'
            }, status = 200)
        
            response.set_cookie(
                key = 'access_token',
                value = access_token,
                httponly = True,
                secure = False,
                samesite = 'lax',
                path = '/'
                )
            return response
        
        except (TokenError):
            return Response({
                'message': 'Invalid refresh token'
            }, status = 400)
            
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        if not user.check_password(request.data['old_password']):
            return Response({
                'message': 'Password incorrect'
            }, status = 400)
            
        user.set_password(request.data['new_password'])
        user.save()
        return Response({
            'message': 'Password Updated'
        }, status = 200)
        
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({
                'message': 'Logout Successfully'
            }, status = 200)
        except Exception:
            return Response({
                'message': 'Invalid token'
            }, status = 400)

            
class Dashboard(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        
        return Response({
            'message': f"Welcome {request.user.username} to the Dashboard",
            'user': request.user.username,
            'email': request.user.email,
            'role': request.user.role.name
        })