"""
Management command to generate fake/demo data for the CRM
Usage: python manage.py generate_fake_data [--flush]
"""

import random
from decimal import Decimal
from datetime import datetime, timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker

from crm.models import Company, Contact, Lead, Deal, Request, CrmEmail, Department, SalesStage, RequestStatus
from common.models import User, UserProfile
from tasks.models import Task, Project, TaskStatus
from chat.models import Message


class Command(BaseCommand):
    help = 'Generate fake CRM data for testing and demonstration'

    def add_arguments(self, parser):
        parser.add_argument(
            '--flush',
            action='store_true',
            dest='flush',
            help='Delete all existing data before generating new data',
        )
        parser.add_argument(
            '--count',
            type=int,
            default=100,
            help='Number of records to generate (default: 100)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting fake data generation...'))

        if options['flush']:
            self.stdout.write(self.style.WARNING('Flushing existing data...'))
            Company.objects.all().delete()
            Contact.objects.all().delete()
            Lead.objects.all().delete()
            Deal.objects.all().delete()
            Task.objects.all().delete()
            Project.objects.all().delete()
            Message.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Data flushed.'))

        fake = Faker()
        
        # Get or create default department and user
        dept, _ = Department.objects.get_or_create(
            name='Sales',
            defaults={
                'description': 'Sales Department',
                'created_at': timezone.now(),
            }
        )

        try:
            user = User.objects.filter(is_staff=True).first()
            if not user:
                user = User.objects.create_superuser(
                    username='admin',
                    email='admin@example.com',
                    password='admin123'
                )
        except:
            user = User.objects.first()

        self.stdout.write(self.style.SUCCESS(f'Using user: {user}'))

        count = options['count']

        # Generate Companies
        self.stdout.write(self.style.SUCCESS(f'Generating {count} companies...'))
        companies = []
        for i in range(count):
            company = Company.objects.create(
                name=fake.company(),
                website=fake.url(),
                phone=fake.phone_number(),
                email=fake.company_email(),
                description=fake.text(max_nb_chars=200),
                country=fake.country(),
                city=fake.city(),
                address=fake.address(),
                owner=user,
                department=dept,
                created_at=timezone.now() - timedelta(days=random.randint(1, 365)),
            )
            companies.append(company)
            if (i + 1) % 20 == 0:
                self.stdout.write(f'  Created {i + 1} companies...')

        # Generate Contacts
        self.stdout.write(self.style.SUCCESS(f'Generating {count * 2} contacts...'))
        contacts = []
        for i in range(count * 2):
            company = random.choice(companies)
            contact = Contact.objects.create(
                first_name=fake.first_name(),
                second_name=fake.last_name(),
                email=fake.email(),
                phone=fake.phone_number(),
                company=company,
                position=fake.job(),
                description=fake.text(max_nb_chars=150),
                owner=user,
                department=dept,
                created_at=timezone.now() - timedelta(days=random.randint(1, 365)),
            )
            contacts.append(contact)
            if (i + 1) % 40 == 0:
                self.stdout.write(f'  Created {i + 1} contacts...')

        # Generate Leads
        self.stdout.write(self.style.SUCCESS(f'Generating {count} leads...'))
        leads = []
        for i in range(count):
            lead = Lead.objects.create(
                first_name=fake.first_name(),
                second_name=fake.last_name(),
                email=fake.email(),
                phone=fake.phone_number(),
                company_name=fake.company(),
                description=fake.text(max_nb_chars=150),
                owner=user,
                department=dept,
                created_at=timezone.now() - timedelta(days=random.randint(1, 365)),
            )
            leads.append(lead)
            if (i + 1) % 20 == 0:
                self.stdout.write(f'  Created {i + 1} leads...')

        # Generate Deals
        self.stdout.write(self.style.SUCCESS(f'Generating {count} deals...'))
        deal_stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']
        deals = []
        for i in range(count):
            stage = random.choice(deal_stages)
            is_won = stage == 'Closed Won'
            
            deal = Deal.objects.create(
                name=fake.catch_phrase(),
                company=random.choice(companies),
                description=fake.text(max_nb_chars=200),
                amount=Decimal(random.randint(5000, 500000)),
                stage=stage,
                probability=random.randint(10, 100) if not is_won else 100,
                owner=user,
                department=dept,
                close_date=timezone.now() + timedelta(days=random.randint(1, 180)),
                is_won=is_won,
                created_at=timezone.now() - timedelta(days=random.randint(1, 365)),
            )
            deals.append(deal)
            if (i + 1) % 20 == 0:
                self.stdout.write(f'  Created {i + 1} deals...')

        # Generate Tasks
        self.stdout.write(self.style.SUCCESS(f'Generating {count} tasks...'))
        task_types = ['Call', 'Email', 'Meeting', 'Follow-up', 'Demo', 'Negotiation']
        statuses = ['To Do', 'In Progress', 'Done']
        
        project, _ = Project.objects.get_or_create(
            name='Sales Pipeline',
            defaults={'owner': user, 'department': dept}
        )
        
        for i in range(count):
            task = Task.objects.create(
                title=f'{random.choice(task_types)} - {fake.catch_phrase()}',
                description=fake.text(max_nb_chars=200),
                project=project,
                owner=user,
                department=dept,
                status=random.choice(statuses),
                due_date=timezone.now() + timedelta(days=random.randint(1, 90)),
                priority=random.choice(['Low', 'Medium', 'High', 'Critical']),
                created_at=timezone.now() - timedelta(days=random.randint(1, 365)),
            )
            if (i + 1) % 20 == 0:
                self.stdout.write(f'  Created {i + 1} tasks...')

        # Generate Emails
        self.stdout.write(self.style.SUCCESS(f'Generating {count} emails...'))
        for i in range(count):
            contact = random.choice(contacts)
            CrmEmail.objects.create(
                subject=fake.sentence(),
                body=fake.text(max_nb_chars=300),
                from_email=user.email,
                to_email=contact.email,
                contact=contact,
                owner=user,
                department=dept,
                created_at=timezone.now() - timedelta(days=random.randint(1, 365)),
            )
            if (i + 1) % 20 == 0:
                self.stdout.write(f'  Created {i + 1} emails...')

        # Generate Messages
        self.stdout.write(self.style.SUCCESS(f'Generating {count // 2} messages...'))
        for i in range(count // 2):
            Message.objects.create(
                title=fake.catch_phrase(),
                message=fake.text(max_nb_chars=200),
                owner=user,
                department=dept,
                created_at=timezone.now() - timedelta(days=random.randint(1, 365)),
            )
            if (i + 1) % 10 == 0:
                self.stdout.write(f'  Created {i + 1} messages...')

        # Summary
        self.stdout.write(self.style.SUCCESS('\n=== Fake Data Generation Complete ==='))
        self.stdout.write(f'✓ Companies: {Company.objects.count()}')
        self.stdout.write(f'✓ Contacts: {Contact.objects.count()}')
        self.stdout.write(f'✓ Leads: {Lead.objects.count()}')
        self.stdout.write(f'✓ Deals: {Deal.objects.count()}')
        self.stdout.write(f'✓ Tasks: {Task.objects.count()}')
        self.stdout.write(f'✓ Emails: {CrmEmail.objects.count()}')
        self.stdout.write(f'✓ Messages: {Message.objects.count()}')
        self.stdout.write(self.style.SUCCESS('All data has been generated successfully!'))
