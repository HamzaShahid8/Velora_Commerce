from django.shortcuts import render
from rest_framework import viewsets, status
from .models import *
from .serializers import *
from roles_permissions.permissions import *
from roles_permissions.services import *
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from activity_logs.models import *
from activity_logs.utils import *

# Create your views here.
class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, HasPermission]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        "id",
        "invoice_number",
        "customer",
        "status",
        "issue_date",
        "due_date",
    ]
    search_fields = [
        "invoice_number",
        "customer__email",
        "customer__username",
        "notes",
    ]
    ordering_fields = [
        "id",
        "created_at",
        "issue_date",
        "due_date",
        "grand_total",
        "paid_amount",
        "remaining_amount",
    ]

    def get_permissions(self):
        permission = HasPermission()

        if self.action == "create":
            permission.required_permissions = "create_bill"
        elif self.action in ["update", "partial_update"]:
            permission.required_permissions = "update_bill"
        elif self.action == "destroy":
            permission.required_permissions = "delete_bill"
        elif self.action in ["list", "retrieve"]:
            permission.required_permissions = "view_bill"

        return [permission]
    
    def perform_create(self, serializer):
        if self.request.user.role.name == 'admin':
            invoice = serializer.save()
        else:
            invoice = serializer.save(created_by = self.request.user)
            
        create_log(
            user=self.request.user,
            action='create',
            invoice=invoice
        )
        
    def perform_update(self, serializer):
        invoice = serializer.save()
        
        create_log(
            user=self.request.user,
            action='update',
            invoice=invoice
        )
        
    def perform_destroy(self, instance):
        create_log(
            user=self.request.user,
            action='delete',
            invoice=instance
        )
        instance.delete()

class InvoiceItemViewSet(viewsets.ModelViewSet):
    queryset = InvoiceItem.objects.all()
    serializer_class = InvoiceItemSerializer
    permission_classes = [IsAuthenticated, HasPermission]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id", "invoice", "product_design", "item_name"]
    search_fields = ["item_name", "invoice__invoice_number"]
    ordering_fields = ["id", "created_at", "quantity", "unit_price"]

    def get_permissions(self):
        permission = HasPermission()

        if self.action == "create":
            permission.required_permissions = "create_bill"
        elif self.action in ["update", "partial_update"]:
            permission.required_permissions = "update_bill"
        elif self.action == "destroy":
            permission.required_permissions = "delete_bill"
        elif self.action in ["list", "retrieve"]:
            permission.required_permissions = "view_bill"

        return [permission]
    
    def perform_create(self, serializer):
        invoice_item = serializer.save()

        create_log(
            user=self.request.user,
            action="create",
            invoice=invoice_item.invoice,
            invoice_item=invoice_item,
            product_design=invoice_item.product_design
        )

    def perform_update(self, serializer):
        invoice_item = serializer.save()

        create_log(
            user=self.request.user,
            action="update",
            invoice=invoice_item.invoice,
            invoice_item=invoice_item,
            product_design=invoice_item.product_design
        )

    def perform_destroy(self, instance):
        create_log(
            user=self.request.user,
            action="delete",
            invoice=instance.invoice,
            invoice_item=instance,
            product_design=instance.product_design
        )

        instance.delete()


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, HasPermission]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["id", "invoice", "payment_method", "paid_at"]
    search_fields = ["invoice__invoice_number", "transaction_id", "notes"]
    ordering_fields = ["id", "paid_at", "amount", "created_at"]

    def get_permissions(self):
        permission = HasPermission()

        if self.action == "create":
            permission.required_permissions = "create_bill"
        elif self.action in ["update", "partial_update"]:
            permission.required_permissions = "update_bill"
        elif self.action == "destroy":
            permission.required_permissions = "delete_bill"
        elif self.action in ["list", "retrieve"]:
            permission.required_permissions = "view_bill"

        return [permission]

    def perform_create(self, serializer):
        if self.request.user.role.name == 'admin':
            payment = serializer.save()
        else:
            payment = serializer.save(received_by = self.request.user)
            
        
        create_log(
            user=self.request.user,
            action='create',
            invoice=payment.invoice,
            payment=payment
        )
        
    def perform_update(self, serializer):
        payment = serializer.save()
        
        create_log(
            user=self.request.user,
            action='update', 
            invoice=payment.invoice,
            payment=payment
        )
        
    def perform_destroy(self, instance):
        create_log(
            user=self.request.user,
            action='delete',
            invoice=instance.invoice,
            payment=instance
        )
        instance.delete()