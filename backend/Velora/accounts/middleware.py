from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model

User = get_user_model()


class JWTHttpOnlyMiddleware:

    def __init__(self, get_response): # app start hony pr yay start hota h
        self.get_response = get_response

        #  Public routes (no auth required)
        self.public_paths = [
            "/cookies/login/",
            "/cookies/register/",
        ]

    def __call__(self, request): # har request pr yay function call hoga

        # Skip middleware for public routes
        if request.path in self.public_paths:
            request.user = AnonymousUser()
            return self.get_response(request)

        # Get token from cookie
        token = request.COOKIES.get("access_token")

        if token:
            try:
                # Decode JWT token
                decoded_token = AccessToken(token)

                #  Extract user id from token
                user_id = decoded_token["user_id"]

                # Get user from DB
                user = User.objects.get(id=user_id)

                # Attach user to request
                request.user = user

            except Exception:
                # Invalid or expired token
                request.user = AnonymousUser()

        else:
            # No token found
            request.user = AnonymousUser()

        # Continue request flow
        response = self.get_response(request)
        return response