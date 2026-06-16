from django.db import models
from accounts.models import *
from accounts.models import BaseModel

# Create your models here.

class AdminProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin')
    phone = models.CharField(blank=True, null=True)
    admin_code = models.CharField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.admin_code}"
    
    

class ManagerProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='manager')
    phone = models.CharField(blank=True, null=True)
    department = models.CharField(max_length=100)
    salary = models.DecimalField(max_digits=10 ,decimal_places=2 ,blank=True ,null=True)
    joining_date = models.DateField(blank=True, null=True)
    manager_code = models.CharField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.department} - {self.manager_code}"
    
    

class WorkerProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='worker')
    phone = models.CharField(blank=True, null=True)
    skill = models.CharField(max_length=100)
    experience_years = models.PositiveIntegerField(default=0)
    salary = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    availability = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.skill} - {self.availability} - {self.salary}"
    
    

class ClientProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client')
    phone = models.CharField(blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    chest_size = models.CharField(max_length=20, blank=True, null=True)
    waist_size = models.CharField(max_length=20, blank=True, null=True)
    shoulder_size = models.CharField(max_length=20, blank=True, null=True)
    arm_size = models.CharField(max_length=20, blank=True, null=True)
    hip_size = models.CharField(max_length=20, blank=True, null=True)
    neck_size = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.phone}"