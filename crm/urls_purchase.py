from django.urls import path
from crm.views.purchase_views import (
    create_purchase,
    PurchaseListView,
    PurchaseDetailView,
    PurchaseUpdateView,
    PurchaseDeleteView,
)

app_name = 'purchase'

urlpatterns = [
    path('', PurchaseListView.as_view(), name='list'),
    path('create/', create_purchase, name='create'),
    path('<int:pk>/', PurchaseDetailView.as_view(), name='detail'),
    path('<int:pk>/edit/', PurchaseUpdateView.as_view(), name='edit'),
    path('<int:pk>/delete/', PurchaseDeleteView.as_view(), name='delete'),
]
