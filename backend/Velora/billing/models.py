from django.db import models
from accounts.models import *
from products.models import *
from roles_permissions.permissions import *
from roles_permissions.services import *
from profiles.models import *
import uuid
from decimal import Decimal
from django.utils import timezone

# Create your models here.

class Invoice(BaseModel):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("unpaid", "Unpaid"),
        ("partial", "Partial"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("cash", "Cash"),
        ("bank_transfer", "Bank Transfer"),
        ("card", "Card"),
        ("easypaisa", "Easypaisa"),
        ("jazzcash", "JazzCash"),
        ("other", "Other"),
    ]
    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    customer = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name="customer_invoices")
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name="created_invoices")
    issue_date = models.DateField(default=timezone.localdate)
    due_date = models.DateField(null=True, blank=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    remaining_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = f"INV-{uuid.uuid4().hex[:8].upper()}"
            
        self.remaining_amount = self.grand_total - self.paid_amount
        
        if self.grand_total > 0:
            if self.paid_amount >= self.grand_total:
                self.status = 'paid'
                self.remaining_amount = Decimal('0.00')
            elif self.paid_amount > 0:
                self.status = 'partial'
            elif self.status != 'cancelled':
                self.status = 'unpaid'
                
        super().save(*args, **kwargs)
        
    def calculate_totals(self):
        items = self.items.all()

        subtotal = sum(item.line_total for item in items)
        discount = sum(item.discount_amount for item in items)
        tax = sum(item.tax_amount for item in items)

        self.subtotal = subtotal
        self.discount_amount = discount
        self.tax_amount = tax
        self.grand_total = subtotal - discount + tax
        self.remaining_amount = self.grand_total - self.paid_amount

        self.save()

    def __str__(self):
        return f"{self.invoice_number} - {self.grand_total}"

class InvoiceItem(BaseModel):
    invoice = models.ForeignKey('billing.Invoice', on_delete=models.CASCADE, related_name="items")
    product_design = models.ForeignKey('products.ProductDesign', on_delete=models.SET_NULL, null=True, blank=True)
    item_name = models.CharField(max_length=150)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    def save(self, *args, **kwargs):
        base_total = Decimal(self.quantity) * self.unit_price

        self.discount_amount = (base_total * self.discount_percentage) / Decimal("100")
        taxable_amount = base_total - self.discount_amount
        self.tax_amount = (taxable_amount * self.tax_percentage) / Decimal("100")
        self.line_total = base_total

        super().save(*args, **kwargs)

        if self.invoice:
            self.invoice.calculate_totals()

    def delete(self, *args, **kwargs):
        invoice = self.invoice
        super().delete(*args, **kwargs)
        if invoice:
            invoice.calculate_totals()

    def __str__(self):
        return f"{self.item_name} x {self.quantity}"


class Payment(BaseModel):
    PAYMENT_METHOD_CHOICES = [
        ("cash", "Cash"),
        ("bank_transfer", "Bank Transfer"),
        ("card", "Card"),
        ("easypaisa", "Easypaisa"),
        ("jazzcash", "JazzCash"),
        ("other", "Other"),
    ]
    invoice = models.ForeignKey('billing.Invoice', on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=150, blank=True, null=True)
    paid_at = models.DateTimeField(default=timezone.now)
    received_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new and self.invoice:
            self.invoice.paid_amount += self.amount
            self.invoice.payment_method = self.payment_method
            self.invoice.save()

    def __str__(self):
        return f"{self.invoice.invoice_number} - {self.amount}"