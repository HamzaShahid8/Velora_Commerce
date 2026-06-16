from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, InvoiceItemViewSet, PaymentViewSet

router = DefaultRouter()

router.register("invoices", InvoiceViewSet, basename="invoices")
router.register("invoice-items", InvoiceItemViewSet, basename="invoice-items")
router.register("payments", PaymentViewSet, basename="payments")

urlpatterns = [
    path("", include(router.urls)),
]