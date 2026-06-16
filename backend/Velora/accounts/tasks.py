from .models import *
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task(bind=True)
def send_otp_email(self, otp_id):
    otp_object = OTP.objects.get(id=otp_id)
    
    subject = 'Your OTP Code'
    message = f"Your OTP Code is {otp_object.otp}. It will expire in 5 minutes."
    
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [otp_object.email],
        fail_silently=False
    )
    
    return f"OTP Sent to {otp_object.email}"