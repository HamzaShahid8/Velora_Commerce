from django.contrib import admin
from .models import *


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('id', 'name')
    ordering = ('id',)

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'can_access_admin')
    search_fields = ('id', 'name', 'can_access_admin')
    filter_horizontal = ('permissions',)
    ordering = ('id',)

@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'role','permission')
    search_fields = ('role__name', 'permission__name')
    list_filter = ('role', 'permission')
    ordering = ('id',)