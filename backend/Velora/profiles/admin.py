from django.contrib import admin
from .models import *

@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ('id','user__username', 'phone', 'admin_code')
    search_fields = ('id','user__username', 'user__email', 'admin_code')


@admin.register(ManagerProfile)
class ManagerProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user__username', 'phone', 'department', 'salary', 'manager_code', 'joining_date')
    search_fields = ('id', 'user__username', 'user__email', 'department', 'manager_code')
    list_filter = ('department', 'joining_date')


@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user__username', 'phone', 'skill', 'experience_years', 'salary', 'availability')
    search_fields = ('id', 'user__username', 'user__email', 'skill')
    list_filter = ('skill', 'availability')


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = (\
        'id',
        'user__username',
        'phone',
        'gender',
        'chest_size',
        'waist_size',
        'shoulder_size',
        'arm_size',
        'hip_size',
        'neck_size'
    )
    search_fields = ('id', 'user__username', 'user__email', 'gender', 'phone')
    list_filter = ('gender',)