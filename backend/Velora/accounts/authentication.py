from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class CookieJWTAuthentication(JWTAuthentication):
    
    def authenticate(self, request): # yay har request pr run hogi
        access_token = request.COOKIES.get('access_token')
        
        if not access_token:
            return None
        try:
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        
        except (TokenError, InvalidToken):
            return None