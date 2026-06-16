from django.shortcuts import render
from roles_permissions.permissions import *
from .models import *
from rest_framework import viewsets
from .serializers import *
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    
    def get_permissions(self):
        permission = HasPermission()
        
        
        if self.action == 'create':
            permission.required_permissions = 'create_role'
            
        elif self.action in ['update', 'partial_update']:
            permission.required_permissions = 'update_role'
            
        elif self.action == 'destroy':
            permission.required_permissions = 'delete_role'
            
        elif self.action in ['list', 'retrieve']:
            permission.required_permissions = 'view_role'
            
        return [permission]

class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    
    def get_permissions(self):
        permission = HasPermission()
        
        
        if self.action == 'create':
            permission.required_permissions = 'create_permission'
            
        elif self.action in ['update', 'partial_update']:
            permission.required_permissions = 'update_permission'
            
        elif self.action in ['list', 'retrieve']:
            permission.required_permissions = 'view_permission'
            
        return [permission]
    
class RolePermissionViewSet(viewsets.ModelViewSet):
    queryset = RolePermission.objects.all()
    serializer_class = RolePermissionSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    
    def get_permissions(self):
        permission = HasPermission()
        
        if self.action == 'create':
            permission.required_permissions = 'create_role_permission'
            
        elif self.action in ['update', 'partial_update']:
            permission.required_permissions = 'update_role_permission'
            
        elif self.action in ['list', 'retrieve']:
            permission.required_permissions = 'view_role_permission'
            
        return [permission]