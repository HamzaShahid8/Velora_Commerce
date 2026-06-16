from django.core.management.base import BaseCommand
from roles_permissions.models import *

class Command(BaseCommand):
    help = "Create default roles only"

    def handle(self, *args, **kwargs):

        roles = ["admin", "manager", "worker", "customer"]

        for role_name in roles:
            role, created = Role.objects.get_or_create(name=role_name)

            if created:
                self.stdout.write(self.style.SUCCESS(f"Role created: {role_name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Role already exists: {role_name}"))

        self.stdout.write(self.style.SUCCESS("Roles seeding completed!"))