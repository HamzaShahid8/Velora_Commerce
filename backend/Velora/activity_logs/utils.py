from .models import *

def create_log(user, action, product_design=None, product=None, invoice=None, invoice_item=None, payment=None):
    
    if not user or not user.is_authenticated:
        return None
    
    return ActivityLog.objects.create(
        user=user,
        action=action,
        product_design=product_design,
        product=product,
        invoice=invoice,
        invoice_item=invoice_item,
        payment=payment
    )