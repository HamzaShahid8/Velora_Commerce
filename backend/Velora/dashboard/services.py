from accounts.models import *
from products.models import *
from roles_permissions.models import *
from profiles.models import *
from billing.models import *
from django.db.models import Sum

class DashboardService:
    
    @staticmethod
    def get_dashboard_data(user):
        
        if user.role.name == 'admin':
            product_low_stock = Product.objects.filter(stock__lt=0).all().order_by('stock')
            product_high_stock = Product.objects.filter(stock__gt=30).all().order_by('stock')
            product_stock = Product.objects.aggregate(stock = Sum('stock'))
            total_users = User.objects.count()
            total_clients = User.objects.filter(role__name = 'customer').count()
            total_workers = User.objects.filter(role__name = 'worker').count()
            total_products = Product.objects.count()
            total_invoices = Invoice.objects.count()
            total_payments = Payment.objects.count()
            
            return {
                'products_low_stock': product_low_stock,
                'products_high_stock': product_high_stock,
                'product_stock': product_stock,
                'total_users': total_users,
                'total_clients': total_clients,
                'total_workers': total_workers,
                'total_products': total_products,
                'total_invoices': total_invoices,
                'total_payments': total_payments,
            }
            
        elif user.role.name == 'manager':
            product_stock = Product.objects.aggregate(stock = Sum('stock'))
            total_workers = User.objects.filter(role__name = 'worker').all()
            total_workers = User.objects.filter(role__name = 'worker').count()
            total_clients = User.objects.filter(role__name = 'customer').count()
            total_products = Product.objects.count()
            total_invoices = Invoice.objects.count()
            total_payments = Payment.objects.count()
            product_high_stock = Product.objects.filter(stock__gt=30).all().order_by('stock')
            product_low_stock = Product.objects.filter(stock__lt__10).all().order_by('stock')
            return {
                'product_stock': product_stock,
                'total_workers': total_workers,
                'total_clients': total_clients,
                'total_products': total_products,
                'total_invoices': total_invoices,
                'total_payments': total_payments,
                'product_high_stock': product_high_stock,
                'product_low_stock': product_low_stock,
            }
            
        elif user.role.name == 'worker':
            own_product_designs = ProductDesign.objects.filter(created_by=user)
            products = Product.objects.all()
            total_products = Product.objects.count()
            product_designs = ProductDesign.objects.all()
            total_product_designs = ProductDesign.objects.count()
            
            return {
                'total_products': total_products,
                'total_product_designs': total_product_designs,
                'products': products,
                'product_designs': product_designs,
            }
            
        elif user.role.name == 'customer':
            total_invoices = Invoice.objects.filter(customer=user).all()
            total_invoices_count = Invoice.objects.filter(customer=user).count()
            product_designs = ProductDesign.objects.filter(status='active').all()
            payments = Payment.objects.filter(invoice__customer=user).all()
            
            return {
                'total_invoices': total_invoices,
                "total_invoices_count": total_invoices_count,
                'product_designs': product_designs,
                'payments': payments,
            }
            
        else:
            return {
                'message': 'Unknown role'
            }