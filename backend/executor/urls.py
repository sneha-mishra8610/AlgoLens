from django.urls import path
from . import views

urlpatterns = [
    path('execute/', views.execute_code, name='execute_code'),
    path('examples/', views.get_example_code, name='examples'),
]