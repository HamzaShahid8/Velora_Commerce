from django.contrib import admin
from .models import *

# Register your models here.

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email', 'password', 'role', 'image')
    search_fields = ('id', 'username', 'role', 'email')
    
    
@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'otp', 'is_verified', 'expires_at', 'created_at')
    search_fields = ('id', 'email', 'is_verified', 'expires_at')