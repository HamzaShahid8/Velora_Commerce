from django.core.management.base import BaseCommand
from roles_permissions.models import *

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        perms = [
            "create_role",
            "update_role",
            "delete_role",
            "view_role",
            "create_permission",
            "update_permission",
            "delete_permission",
            "view_permission",
            "create_product",
            "update_product",
            "delete_product",
            "view_product",
            "create_product_design",
            "update_product_design",
            "delete_product_design",
            "view_product_design",
            "create_order",
            "update_order",
            "delete_order",
            "view_order",
            "create_bill",
            "update_bill",
            "delete_bill",
            "view_bill",
            "create_role_permission",
            "update_role_permission",
            "delete_role_permission",
            "view_role_permission",
            'can_access_admin',
            'create_admin_profile',
            'update_admin_profile',
            'delete_admin_profile',
            'view_admin_profile',
            'create_manager_profile',
            'update_manager_profile',
            'delete_manager_profile',
            'view_manager_profile',
            'create_customer_profile',
            'update_customer_profile',
            'delete_customer_profile',
            'view_customer_profile',
            'create_worker_profile',
            'update_worker_profile',
            'delete_worker_profile',
            'view_worker_profile',
        ]

        for p in perms:
            Permission.objects.get_or_create(name=p)

        self.stdout.write(self.style.SUCCESS("Permissions loaded successfully"))