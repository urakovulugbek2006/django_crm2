from django.contrib import admin
from django.utils.html import format_html
from crm.models import Purchase


class PurchaseAdmin(admin.ModelAdmin):
    """Admin interface for tracking user purchases"""
    
    list_display = [
        'get_purchaser',
        'get_product',
        'quantity',
        'get_total_price',
        'status_badge',
        'purchase_date_display',
        'get_delivery_status'
    ]
    
    list_filter = [
        'status',
        'purchase_date',
        'product',
        'currency',
    ]
    
    search_fields = [
        'user__first_name',
        'user__last_name',
        'user__username',
        'product__name',
        'invoice_number',
    ]
    
    readonly_fields = [
        'creation_date',
        'update_date',
        'total_price',
        'get_purchaser_link',
    ]
    
    fieldsets = (
        ('Purchase Information', {
            'fields': (
                'product',
                'user',
                'status',
            )
        }),
        ('Quantity & Pricing', {
            'fields': (
                'quantity',
                'unit_price',
                'total_price',
                'currency',
            )
        }),
        ('Dates', {
            'fields': (
                'purchase_date',
                'delivery_date',
            )
        }),
        ('Product Details', {
            'fields': (
                'size',
                'color',
            ),
            'classes': ('collapse',)
        }),
        ('Payment Information', {
            'fields': (
                'payment_method',
                'invoice_number',
            ),
            'classes': ('collapse',)
        }),
        ('Additional Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': (
                'owner',
                'department',
                'creation_date',
                'update_date',
            ),
            'classes': ('collapse',)
        }),
    )
    
    def get_purchaser(self, obj):
        """Display purchaser name with link"""
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
    get_purchaser.short_description = 'Purchaser'
    get_purchaser.admin_order_field = 'user__first_name'
    
    def get_purchaser_link(self, obj):
        """Display purchaser as link"""
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
    get_purchaser_link.short_description = 'Purchaser'
    
    def get_product(self, obj):
        """Display product name"""
        return obj.product.name
    get_product.short_description = 'Product/Clothes'
    get_product.admin_order_field = 'product__name'
    
    def get_total_price(self, obj):
        """Display total price with currency"""
        currency_symbol = obj.currency.symbol if obj.currency else '$'
        return f"{currency_symbol} {obj.total_price:,.2f}"
    get_total_price.short_description = 'Total Price'
    get_total_price.admin_order_field = 'total_price'
    
    def status_badge(self, obj):
        """Display status as colored badge"""
        colors = {
            'pending': '#FFA500',      # Orange
            'completed': '#008000',    # Green
            'cancelled': '#FF0000',    # Red
            'returned': '#0000FF',     # Blue
        }
        color = colors.get(obj.status, '#808080')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
    
    def purchase_date_display(self, obj):
        """Display purchase date"""
        return obj.purchase_date.strftime('%Y-%m-%d %H:%M')
    purchase_date_display.short_description = 'Purchase Date'
    purchase_date_display.admin_order_field = 'purchase_date'
    
    def get_delivery_status(self, obj):
        """Display delivery status"""
        if not obj.delivery_date:
            return '—'
        
        from django.utils import timezone
        if obj.delivery_date <= timezone.now():
            return format_html(
                '<span style="color: green;">✓ Delivered</span>'
            )
        else:
            return format_html(
                '<span style="color: orange;">⏳ Pending</span>'
            )
    get_delivery_status.short_description = 'Delivery'
    
    actions = ['mark_completed', 'mark_cancelled']
    
    def mark_completed(self, request, queryset):
        """Bulk action to mark purchases as completed"""
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} purchases marked as completed.')
    mark_completed.short_description = 'Mark selected as Completed'
    
    def mark_cancelled(self, request, queryset):
        """Bulk action to mark purchases as cancelled"""
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} purchases marked as Cancelled.')
    mark_cancelled.short_description = 'Mark selected as Cancelled'


admin.site.register(Purchase, PurchaseAdmin)
