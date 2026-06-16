from django.urls import path, include
from .models import *
from .serializers import *
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register('admins', AdminProfileViewSet, basename = 'admin')
router.register('managers', ManagerProfileViewSet, basename = 'managers')
router.register('workers', WorkerProfileViewSet, basename = 'workers')
router.register('clients', ClientProfileViewSet, basename = 'clients')

urlpatterns = [
    path('', include(router.urls)),
]