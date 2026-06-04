from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.generic import ListView, DetailView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from crm.models import Purchase
from crm.forms.purchase import PurchaseForm


@login_required
def create_purchase(request):
    if request.method == 'POST':
        form = PurchaseForm(request.POST, user=request.user)
        if form.is_valid():
            purchase = form.save()
            messages.success(request, 'Purchase created successfully!')
            return redirect('purchase:list')
    else:
        form = PurchaseForm(user=request.user)
    return render(request, 'crm/purchase_form.html', {'form': form, 'title': 'Create Purchase'})


class PurchaseListView(LoginRequiredMixin, ListView):
    model = Purchase
    template_name = 'crm/purchase_list.html'
    context_object_name = 'purchases'
    paginate_by = 20
    
    def get_queryset(self):
        return Purchase.objects.filter(user=self.request.user).order_by('-purchase_date')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['total_spent'] = sum(p.total_price for p in self.get_queryset())
        return context


class PurchaseDetailView(LoginRequiredMixin, DetailView):
    model = Purchase
    template_name = 'crm/purchase_detail.html'
    context_object_name = 'purchase'
    
    def get_queryset(self):
        return Purchase.objects.filter(user=self.request.user)


class PurchaseUpdateView(LoginRequiredMixin, UpdateView):
    model = Purchase
    form_class = PurchaseForm
    template_name = 'crm/purchase_form.html'
    success_url = reverse_lazy('purchase:list')
    
    def get_queryset(self):
        return Purchase.objects.filter(user=self.request.user)
    
    def form_valid(self, form):
        messages.success(self.request, 'Purchase updated!')
        return super().form_valid(form)
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.request.user
        return kwargs


class PurchaseDeleteView(LoginRequiredMixin, DeleteView):
    model = Purchase
    template_name = 'crm/purchase_confirm_delete.html'
    success_url = reverse_lazy('purchase:list')
    
    def get_queryset(self):
        return Purchase.objects.filter(user=self.request.user)
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Purchase deleted!')
        return super().delete(request, *args, **kwargs)
