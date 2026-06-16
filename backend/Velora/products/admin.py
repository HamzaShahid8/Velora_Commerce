from django.contrib import admin
from .models import *

# Register your models here.

@admin.register(ProductDesign)
class ProductDesignAdmin(admin.ModelAdmin):
    list_display = ['id', 'code', 'name', 'price', 'status','category', 'created_by']
    list_filter = ['status', 'category', 'created_by']
    search_fields = ['code', 'name', 'description', 'category']
    readonly_fields = ['code']
    fieldsets = (
        ("Basic Info", {
            "fields": ("code", "name", "description", "category")
        }),
        ("Media", {
            "fields": ("image",)
        }),
        ("Pricing", {
            "fields": ("price", "status")
        }),
        ("Meta", {
            "fields": ("created_by",)
        }),
    )
    
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'design', 'stock', 'created_by']
    list_filter = ['design', 'created_by']
    search_fields = ['title', 'design__name']