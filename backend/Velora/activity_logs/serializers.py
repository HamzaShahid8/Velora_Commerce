from rest_framework import serializers
from .models import *

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'user', 'action', 'product_design', 'product', 'invoice', 'invoice_item', 'payment', 'timestamp']
        read_only_fields = ['id', 'timestamp']