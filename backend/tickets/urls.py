from django.urls import path
from . import views

urlpatterns = [
    path('tickets/', views.ticket_list_create),
    path('tickets/stats/', views.ticket_stats),
    path('tickets/classify/', views.classify),
    path('tickets/<int:pk>/', views.ticket_detail),
]
