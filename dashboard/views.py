from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from crm.models import Deal, Lead, Company, Stage
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth
from datetime import date, timedelta
import json

@login_required
def dashboard_view(request):
    # Stats
    total_deals = Deal.objects.filter(active=True).count()
    total_leads = Lead.objects.count()
    total_companies = Company.objects.count()
    total_revenue = Deal.objects.filter(active=True).aggregate(Sum('amount'))['amount__sum'] or 0

    # Deals by stage
    deals_by_stage = list(
        Deal.objects.filter(active=True)
        .values('stage__name')
        .annotate(count=Count('id'), total=Sum('amount'))
        .order_by('-total')
    )

    # Top deals
    top_deals = Deal.objects.filter(active=True).order_by('-amount')[:8]

    # Recent leads
    recent_leads = Lead.objects.order_by('-creation_date')[:8]

    # Monthly deal amounts (last 6 months)
    monthly_data = []
    for i in range(5, -1, -1):
        month_start = date.today().replace(day=1) - timedelta(days=i*30)
        month_end = month_start.replace(day=28) + timedelta(days=4)
        amount = Deal.objects.filter(
            creation_date__date__gte=month_start,
            creation_date__date__lte=month_end,
            active=True
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        monthly_data.append({
            'month': month_start.strftime('%b'),
            'amount': float(amount)
        })

    # Win probability distribution
    prob_ranges = [
        {'range': '0-25%', 'count': Deal.objects.filter(probability__lte=25).count()},
        {'range': '26-50%', 'count': Deal.objects.filter(probability__gt=25, probability__lte=50).count()},
        {'range': '51-75%', 'count': Deal.objects.filter(probability__gt=50, probability__lte=75).count()},
        {'range': '76-100%', 'count': Deal.objects.filter(probability__gt=75).count()},
    ]

    context = {
        'total_deals': total_deals,
        'total_leads': total_leads,
        'total_companies': total_companies,
        'total_revenue': total_revenue,
        'deals_by_stage': deals_by_stage,
        'top_deals': top_deals,
        'recent_leads': recent_leads,
        'monthly_data': json.dumps(monthly_data),
        'prob_ranges': json.dumps(prob_ranges),
    }
    return render(request, 'dashboard/index.html', context)
