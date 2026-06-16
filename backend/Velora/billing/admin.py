from django.contrib import admin
from .models import *


class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1
    readonly_fields = ("line_total", "discount_amount", "tax_amount")


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ("paid_at",)


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        "invoice_number",
        "customer",
        "grand_total",
        "paid_amount",
        "remaining_amount",
        "status",
        "issue_date",
    )
    list_filter = ("status", "issue_date")
    search_fields = ("invoice_number", "customer__email", "customer__username")
    readonly_fields = (
        "invoice_number",
        "subtotal",
        "discount_amount",
        "tax_amount",
        "grand_total",
        "remaining_amount",
    )
    inlines = [InvoiceItemInline, PaymentInline]


@admin.register(InvoiceItem)
class InvoiceItemAdmin(admin.ModelAdmin):
    list_display = (
        "invoice",
        "item_name",
        "quantity",
        "unit_price",
        "line_total",
        "discount_amount",
        "tax_amount",
    )
    search_fields = ("item_name", "invoice__invoice_number")
    
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "invoice",
        "amount",
        "payment_method",
        "transaction_id",
        "paid_at",
        "received_by",
    )
    list_filter = ("payment_method", "paid_at")
    search_fields = ("invoice__invoice_number", "transaction_id")