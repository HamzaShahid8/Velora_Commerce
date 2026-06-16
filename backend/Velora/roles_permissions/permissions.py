from rest_framework.permissions import BasePermission
from .services import *

class HasPermission(BasePermission):
    
    required_permissions = None   # class level attribute
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        if not self.required_permissions:
            return True # give access all to anybody
        
        return has_permission(request.user, self.required_permissions)