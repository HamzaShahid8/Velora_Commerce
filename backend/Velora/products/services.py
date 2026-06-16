from .models import *
from django.db.models import Q

class ProductService:
    
    @staticmethod
    def get_filtered_products(query_params):
        
        queryset = ProductDesign.objects.all()
        
        # query params
        category = query_params.get('category')  # url may category name k value lao
        search = query_params.get('search')
        min_price = query_params.get('min_price')
        max_price = query_params.get('max_price')
        
        # category filter
        if category is not None and category != '':
            queryset = queryset.filter(category=category)
            
        # search filter
        if search is not None and search != '':
            queryset = queryset.filter(
                Q(name__icontains = search) |
                Q(description__icontains = search)
            )
            
        # min price filter
        if min_price is not None and min_price != '':
            queryset = queryset.filter(
                price__gte = min_price
            )
            
        # max price filter
        if max_price is not None and max_price != '':
            queryset = queryset.filter(
                price__lte = max_price
            )
            
        return queryset.order_by('created_at')