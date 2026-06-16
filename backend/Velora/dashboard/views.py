from django.shortcuts import render
from .services import *
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

# Create your views here.

class DashboardView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        data = DashboardService.get_dashboard_data(request.user)
        return Response(data)