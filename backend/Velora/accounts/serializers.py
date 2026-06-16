from rest_framework import serializers
from .models import *
from django.contrib.auth import authenticate
from roles_permissions.models import *
from roles_permissions.services import *

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SlugRelatedField(queryset = Role.objects.all(), slug_field= 'name')
    password = serializers.CharField(write_only = True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'image', 'role']
        
    def validate_email(self, email):
        if not email.endswith('@gmail.com'):
            raise serializers.ValidationError('Only Gmail accounts are available')
        return email


    def create(self, validated_data):
        image = validated_data.pop('image', None)
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data)
        
        if user.role and user.role.name.lower() in ['admin', 'manager']:
            user.is_staff = True   # Admin -> admin panel access kr skta h
            user.is_superuser = False
            
        else:
            user.is_staff = False
            user.is_superuser = False
        
        if image:
            user.image = image
        
        user.set_password(password)
        user.save()
        return user
        
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        user = authenticate(
            email = data['email'],
            password = data['password']
        )
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        data['user'] = user
        return data