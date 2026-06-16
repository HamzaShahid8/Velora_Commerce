from django.contrib import admin
from .models import *

# Register your models here.

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'user__email', 'action', 'product_design', 'product', 'invoice', 'invoice_item', 'payment', 'timestamp']