from roles_permissions.models import Role

def has_permission(user, permission_name):
    if not user.is_authenticated:
        return False
    
    if user.is_superuser:
        return True
    
    role = user.role
    if not role:
        return False
    
    return role.permissions.filter(name = permission_name).exists()