from django.db import models
from accounts.models import User
from profiles.models import BaseModel
import uuid

# Create your models here.

class ProductDesign(BaseModel):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('archived', 'Archived'),
    ]
    
    CATEGORY_CHOICES = [
    ("mens_suits", "Men's Suits"),
    ("waistcoats", "Waistcoats"),
    ("sherwanis", "Sherwanis"),
    ("shalwar_kameez", "Shalwar Kameez"),
    ("kurta_pajama", "Kurta Pajama"),
    ("dress_shirts_pants", "Dress Shirts and Pants"),
    ]
    
    code = models.CharField(max_length=500, unique=True, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True , null=True)
    image = models.ImageField(upload_to = 'designs')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='draft')
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='shalwar_kameez')
    
    # auto generate UUID code
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = f"DES-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"{self.code} - {self.name}"
    

class Product(BaseModel):
    design = models.ForeignKey('products.ProductDesign', on_delete=models.CASCADE, related_name='design')
    title = models.CharField(max_length=100)
    stock = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True)
    
    def __str__(self):
        return self.title