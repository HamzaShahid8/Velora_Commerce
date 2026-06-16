from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register('roles', RoleViewSet, basename='roles')
router.register('permissions', PermissionViewSet, basename='permissions')
router.register('roles_permisions', RolePermissionViewSet, basename='roles_permissions')

urlpatterns = [
    path('', include(router.urls)),
]