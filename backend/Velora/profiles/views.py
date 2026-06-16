from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import *
from roles_permissions.permissions import *
from rest_framework.decorators import action
from django.http import HttpResponse
from reportlab.pdfgen import canvas

# Admin Profile
class AdminProfileViewSet(viewsets.ModelViewSet):
    queryset = AdminProfile.objects.all()
    serializer_class = AdminProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user = self.request.user)
        
    def get_queryset(self):
        return AdminProfile.objects.filter(user = self.request.user)
        

# Manager Profile
class ManagerProfileViewSet(viewsets.ModelViewSet):
    queryset = ManagerProfile.objects.all()
    serializer_class = ManagerProfileSerializer
    permission_classes = [IsAuthenticated]

    
    def perform_create(self, serializer):
        if self.request.user.role.name == 'admin':
            serializer.save()
        else:
            serializer.save(user = self.request.user)
        
    def get_queryset(self):
        user = self.request.user
        
        if user.role.name == 'admin':
            return ManagerProfile.objects.all()
        
        return ManagerProfile.objects.filter(user = self.request.user)


# Worker Profile
class WorkerProfileViewSet(viewsets.ModelViewSet):
    queryset = WorkerProfile.objects.all()
    serializer_class = WorkerProfileSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    
    def perform_create(self, serializer):
        if self.request.user.role.name == 'admin':
            serializer.save()
        else:
            serializer.save(user = self.request.user)
        
    def get_queryset(self):
        user = self.request.user
        
        if user.role.name in ['admin', 'manager']:
            return WorkerProfile.objects.all()
        
        return WorkerProfile.objects.filter(user = self.request.user)


# Client Profile
class ClientProfileViewSet(viewsets.ModelViewSet):
    queryset = ClientProfile.objects.all()
    serializer_class = ClientProfileSerializer
    permission_classes = [IsAuthenticated, HasPermission]
    
    def perform_create(self, serializer):
        if self.request.user.role.name == 'admin':
            serializer.save()
        else:
            serializer.save(user = self.request.user)
        
    def get_queryset(self):
        user = self.request.user
        
        if user.role.name in ['admin' ,'manager']:
            return ClientProfile.objects.all()
        
        return ClientProfile.objects.filter(user = self.request.user)
    
    @action(detail=True, methods=['get']) # yay automatically endpoint generate krta hai
    def download_pdf(self, request, pk=None):
        client = self.get_object()

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = (
        f'attachment; filename="client_{client.id}.pdf"'
        )

        p = canvas.Canvas(response)

        p.drawString(100, 800, "Client Profile")
        p.drawString(100, 770, f"Username: {client.user.username}")
        p.drawString(100, 740, f"Email: {client.user.email}")
        p.drawString(100, 710, f"Phone: {client.phone}")
        p.drawString(100, 680, f"Gender: {client.gender}")

        p.drawString(100, 650, f"Chest Size: {client.chest_size}")
        p.drawString(100, 620, f"Waist Size: {client.waist_size}")
        p.drawString(100, 590, f"Shoulder Size: {client.shoulder_size}")
        p.drawString(100, 560, f"Arm Size: {client.arm_size}")
        p.drawString(100, 530, f"Hip Size: {client.hip_size}")
        p.drawString(100, 500, f"Neck Size: {client.neck_size}")

        p.showPage()
        p.save()

        return response