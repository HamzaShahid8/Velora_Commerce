from rest_framework import serializers
from .models import *

class ProductDesignSerializer(serializers.ModelSerializer):
    created_by = serializers.SlugRelatedField(queryset = User.objects.all(), slug_field = 'email')
    class Meta:
        model = ProductDesign
        fields = ['id', 'code', 'name', 'description', 'image', 'price', 'created_by', 'status', 'category']
        read_only_fields = ['id']
        search_fields = ['id', 'name', 'price', 'status']
        

class ProductSerializer(serializers.ModelSerializer):
    design = serializers.SlugRelatedField(queryset = ProductDesign.objects.all(), slug_field = 'code')
    created_by = serializers.SlugRelatedField(queryset = User.objects.all(), slug_field= 'email')
    class Meta:
        model = Product
        fields = ['id', 'design', 'title', 'stock', 'created_by']
        read_only_fields = ['id']
        search_fields = ['id', 'title', 'stock']