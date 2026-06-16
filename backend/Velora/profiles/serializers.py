from rest_framework import serializers
from .models import *

class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = ['id', 'user', 'phone', 'admin_code']
        read_only_fields = ['id', 'user']
        search_fields = ['id', 'user__username', 'admin_code', 'phone']
        
        

class ManagerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManagerProfile
        fields = ['id', 'user', 'phone', 'department', 'salary', 'joining_date', 'manager_code']
        read_only_fields = ['id', 'user']
        search_fields = ['id', 'user__username', 'salary', 'joining_date', 'manager_code']
        
        

class WorkerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerProfile
        fields = ['id', 'user', 'phone', 'skill', 'experience_years', 'salary', 'availability']
        read_only_fields = ['id', 'user']
        search_fields = ['id', 'user__username', 'salary']
        


class ClientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = ['id', 'user', 'phone', 'gender', 'chest_size', 'waist_size', 'shoulder_size', 'arm_size', 'hip_size', 'neck_size']
        read_only_fields = ['id', 'user']
        search_fields = ['id', 'user__username', "chest_size", 'waist_size', 'shoulder_size', 'arm_size', 'hip_size', 'neck_size']