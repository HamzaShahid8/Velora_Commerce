from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import *
from accounts.models import *

# create profile
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    
    if created:
            
        if instance.role and instance.role.name == 'manager':
            ManagerProfile.objects.get_or_create(user=instance)
            
        elif instance.role and instance.role.name == 'worker':
            WorkerProfile.objects.get_or_create(user=instance)
            
        elif instance.role and instance.role.name == 'customer':
            ClientProfile.objects.get_or_create(user = instance)
        
        else:
            print('Unknown role')