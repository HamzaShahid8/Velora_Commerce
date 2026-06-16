from django.urls import path, include
from .models import *
from .serializers import *
from .views import *
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

router.register('product_designs', ProductDesignViewSet, basename = 'product_designs')
router.register('products', ProductViewSet, basename = 'products')

urlpatterns = [
    path('', include(router.urls)),
]