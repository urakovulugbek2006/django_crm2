from django import forms
from crm.models import Purchase, Product, Currency


class PurchaseForm(forms.ModelForm):
    
    class Meta:
        model = Purchase
        fields = ['product', 'quantity', 'unit_price', 'currency', 'size', 'color', 'payment_method', 'delivery_date', 'notes', 'invoice_number']
        widgets = {
            'product': forms.Select(attrs={'class': 'form-control', 'placeholder': 'Select Product'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Quantity', 'min': '1'}),
            'unit_price': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Price', 'step': '0.01'}),
            'currency': forms.Select(attrs={'class': 'form-control'}),
            'size': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Size'}),
            'color': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Color'}),
            'payment_method': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Payment Method'}),
            'delivery_date': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'notes': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'invoice_number': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Invoice'}),
        }
    
    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user
        self.fields['size'].required = False
        self.fields['color'].required = False
        self.fields['payment_method'].required = False
        self.fields['delivery_date'].required = False
        self.fields['notes'].required = False
        self.fields['invoice_number'].required = False
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        if self.user:
            instance.user = self.user
        if commit:
            instance.save()
        return instance
