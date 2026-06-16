from .models import *
from rest_framework import serializers

class InvoiceSerializer(serializers.ModelSerializer):
    customer = serializers.SlugRelatedField(queryset = User.objects.all(), slug_field= 'email')
    created_by = serializers.SlugRelatedField(queryset = User.objects.all(), slug_field= 'email')
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'created_by', 'customer', 'issue_date', 'due_date', 'subtotal', 'discount_amount', 'grand_total', 'tax_amount', 'paid_amount', 'remaining_amount', 'status', 'payment_method', 'notes']
        
class InvoiceItemSerializer(serializers.ModelSerializer):
    product_design = serializers.SlugRelatedField(queryset = ProductDesign.objects.all(), slug_field= 'code')
    invoice = serializers.SlugRelatedField(queryset = Invoice.objects.all(), slug_field='invoice_number')
    class Meta:
        model = InvoiceItem
        fields = ['id', 'invoice', 'product_design', 'item_name', 'quantity', 'unit_price', 'discount_percentage', 'tax_percentage', 'line_total','discount_amount', 'tax_amount']
        
class PaymentSerializer(serializers.ModelSerializer):
    invoice = serializers.SlugRelatedField(queryset = Invoice.objects.all(), slug_field='invoice_number')
    class Meta:
        model = Payment
        fields = ['id', 'invoice', 'amount', 'payment_method', 'transaction_id', 'paid_at', 'received_by', 'notes']