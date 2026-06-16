from django.db import models

# Create your models here.

class Permission(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return self.name
    
class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    permissions = models.ManyToManyField(Permission, blank=True)
    can_access_admin = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name
    
class RolePermission(models.Model):
    role = models.ForeignKey(Role, on_delete=models.CASCADE)
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    
    def __str__(self):
        if self.role and self.permission:
            return f"{self.role.name} - {self.permission.name}"
    
    class Meta:
        unique_together = ('role', 'permission')