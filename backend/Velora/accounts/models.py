from django.db import models
from django.contrib.auth.models import AbstractUser
import random
from django.utils import timezone
from django.contrib.auth.models import Group

# Create your models here.

class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
    
class User(AbstractUser):
    email = models.EmailField(unique=True, null=True, blank=True)
    role = models.ForeignKey('roles_permissions.Role', on_delete=models.SET_NULL, null=True, blank=True)
    image = models.ImageField(upload_to = 'profile_images/', blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return f"{self.email} - {self.role}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.is_superuser:
            return

        role = getattr(self, "role", None)

        should_access_admin = bool(role and role.can_access_admin)

        if self.is_staff != should_access_admin:
            self.is_staff = should_access_admin
            super().save(update_fields=["is_staff"])

        if role:
            group, created = Group.objects.get_or_create(name=role.name)

            self.groups.clear()
            self.groups.add(group)
        else:
            self.groups.clear()

    def __str__(self):
        return self.email or self.username

class OTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=200)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def save(self, *args, **kwargs):
        if not self.otp:
            self.otp = str(random.randint(100000, 999999))
            
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=5)
        
        super().save(*args, **kwargs)