import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DJANGO_DIR = BASE_DIR / "Velora"

sys.path.insert(0, str(DJANGO_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "Velora.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
app = application