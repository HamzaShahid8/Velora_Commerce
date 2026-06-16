from django.db import models
from accounts.models import *
from profiles.models import *
from products.models import *
from billing.models import *
from roles_permissions.models import *
from django.contrib.contenttypes.models import ContentType

# Create your models here.

class ActivityLog(BaseModel):
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('view', 'View'),
        ('login', 'Login'),
        ('logout', 'Logout'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=100, choices=ACTION_CHOICES)
    product_design = models.ForeignKey(ProductDesign, on_delete=models.CASCADE, related_name='activity_logs', null=True, blank=True)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='activity_logs', null=True, blank=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='activity_logs', null=True, blank=True)
    invoice_item = models.ForeignKey(InvoiceItem, on_delete=models.CASCADE, related_name='activity_logs', null=True, blank=True)
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='activity_logs', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user.email} - {self.action} - {self.timestamp}"