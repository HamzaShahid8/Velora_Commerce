from rest_framework.routers import DefaultRouter
from .views import *
from django.urls import path, include

router = DefaultRouter()

router.register('logs', ActivityLogViewSet, basename='logs')

urlpatterns = [
    path('', include(router.urls)),
]