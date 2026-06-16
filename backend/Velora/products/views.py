from django.shortcuts import render
from roles_permissions.models import *
from roles_permissions import services
from .models import *
from rest_framework import viewsets
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from roles_permissions.permissions import HasPermission
from .services import *
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from activity_logs.models import *
from activity_logs.utils import *

# Create your views here.

class ProductDesignViewSet(viewsets.ModelViewSet):
    queryset = ProductDesign.objects.all()
    serializer_class = ProductDesignSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    
    filterset_fields = ['id', 'name', 'category', 'price', 'description']
    
    search_fields = ['id', 'name', 'category','price', 'description']
    
    ordering_fields = ['id', 'name', 'category', 'created_at']
    
    def get_queryset(self):
        if self.action in ['list', 'retrieve']:
            return ProductService.get_filtered_products(self.request.query_params)
        
        return ProductDesign.objects.all()
    
    def get_permissions(self):
        permission = HasPermission()
        
        if self.action == 'create':
            permission.required_permissions = 'create_product_design'
            
        elif self.action in ['update', 'partial_update']:
            permission.required_permissions = 'update_product_design'
            
        elif self.action == 'destroy':
            permission.required_permissions = 'delete_product_design'
            
        elif self.action in ['list', 'retrieve']:
            permission.required_permissions = 'view_product_design'
            
        return [permission]
    
    def perform_create(self, serializer):
        if self.request.user.role.name == 'admin':
            product_design = serializer.save()
        else:
            product_design = serializer.save(created_by = self.request.user)
            
        create_log(
            user=self.request.user,
            action='create',
            product_design=product_design
        )
        
    def perform_update(self, serializer):
        product_design = serializer.save()
        
        create_log(
            user=self.request.user,
            action='update',
            product_design=product_design
        )
        
    def perform_destroy(self, instance):
        create_log(
            user=self.request.user,
            action='delete',
            product_design=instance
        )
        instance.delete()

    
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    
    def get_permissions(self):
        permission = HasPermission()
        
        if self.action == 'create':
            permission.required_permissions = 'create_product'
            
        elif self.action in ['update', 'partial_update']:
            permission.required_permissions = 'update_product'
            
        elif self.action == 'destroy':
            permission.required_permissions = 'delete_product'
            
        elif self.action in ['list', 'retrieve']:
            permission.required_permissions = 'view_product'
            
        return [permission]
    
    def perform_create(self, serializer):
        if self.request.user.role.name == 'admin':
            product = serializer.save()
        else:
            product = serializer.save(created_by = self.request.user)
        
        create_log(
            user=self.request.user,
            action='create',
            product_design=product.design,
            product=product
        )
        
    def perform_update(self, serializer):
        product = serializer.save()
        
        create_log(
            user=self.request.user,
            action='update',
            product_design=product.design,
            product=product
        )
        
    def perform_destroy(self, instance):
        create_log(
            user=self.request.user,
            action='delete',
            product_design=instance.design,
            product=instance
        )
        instance.delete()