# Django CRM Project Structure - Complete Analysis

## Overview
This is a comprehensive Django CRM application with 10+ modules supporting companies, contacts, leads, deals, tasks, emails, and mass mailing.

---

## 1. KEY MODELS & RELATIONSHIPS

### Core CRM Models (crm/models/)

#### Company ↔ Contact ↔ Lead ↔ Deal → Request
```
Company (Base1 + BaseCounterparty)
├── name, website, phone, logo
├── type (FK: ClientType)
├── industry (M2M)
├── country, city (FK)
└── contacts (reverse M2M)
   └── Contact (FK to Company)
       ├── first_name, last_name, title, email, phone
       ├── company (required FK)
       ├── owner (FK: User), department (FK: Group)
       └── contact_emails (reverse)

Lead (independent prospect)
├── company_name, website, company_email
├── similar to Contact but no Company FK required
└── contact (optional FK to Contact for conversion)

Deal (sales pipeline)
├── stage (FK: Stage - required)
├── amount, currency (FK)
├── lead (FK), contact (FK), company (FK)
├── partner_contact (another contact FK)
├── payments (reverse M2M)
├── requests (reverse M2M)
└── closing_date, closing_reason (FK)

Request (customer inquiry)
├── request_for, first_name, email
├── company_name, website
├── lead (FK), contact (FK), company (FK), deal (FK)
├── products (M2M)
├── pending, duplicate, verification_required, case (status flags)
└── ticket (auto-generated)

CrmEmail
├── to, from_field, cc, bcc, subject, content
├── deal (FK), lead (FK), contact (FK), company (FK), request (FK)
├── sent, incoming, trash, inquiry (status flags)
└── uid, message_id (IMAP tracking)
```

### Tasks Module (tasks/models/)

```
Project / Task
├── name, description, next_step, next_step_date
├── stage (FK: ProjectStage / TaskStage)
├── responsible (M2M: User)
├── owner (FK: User), department (FK: Group)
├── Task can have self-referential FK (task) for subtasks
└── Custom: auto-deactivate main task when all subtasks complete
```

### Supporting Models

- **LeadSource**: Lead origin (email, form_template, department FK)
- **Stage**: Deal stages with success/conditional_success/goods_shipped flags
- **ClientType**: Company classification
- **Industry**: Industry categorization
- **Currency**: Multi-currency with exchange rates
- **Payment & Rate**: Payment tracking with conversion
- **Country, City**: Geographic references
- **Tag**: Taggable items (Company/Contact/Lead)
- **Product**: Product/service catalog
- **Output & Shipment**: Shipment tracking

### Generic Models

- **ChatMessage**: Chat thread attached to any model via GenericForeignKey
- **Reminder**: Scheduled reminders (ContentType + object_id)
- **TheFile**: Generic file attachment (ContentType + object_id)

### Authentication & Organization

- **Department**: Extends Group with default_country, default_currency, works_globally
- **UserProfile**: Extended user profile with timezone, PBX settings
- **Base Classes**:
  - `Base`: Abstract with creation_date, update_date, owner, modified_by
  - `Base1`: Extends Base + department FK
  - `BaseContact`: Common contact fields (first_name, email, phone, avatar, etc.)
  - `BaseCounterparty`: Common business entity fields (address, email, tags, etc.)

---

## 2. INSTALLED APPS & PURPOSE

```python
INSTALLED_APPS = [
    # Django core
    'django.contrib.sites',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # CRM apps
    'crm.apps.CrmConfig',              # Core CRM (companies, contacts, leads, deals)
    'common.apps.CommonConfig',        # Shared utilities, files, reminders, departments
    'massmail.apps.MassmailConfig',    # Email marketing, IMAP/SMTP accounts
    'analytics.apps.AnalyticsConfig',  # Analytics views & reports
    'tasks.apps.TasksConfig',          # Task & project management
    'chat.apps.ChatConfig',            # Chat/messaging system
    'voip',                            # VoIP integration
    'help',                            # Help module
    'settings',                        # Settings management
    'quality'                          # Quality tracking
]
```

---

## 3. VIEWS & URL STRUCTURE

### URL Routing (webcrm/urls.py)

```
/favicon.ico                    → Favicon redirect
/voip/                          → VoIP endpoints
/OAuth-2/authorize/             → OAuth2 token refresh (staff only)
/{SECRET_CRM_PREFIX}/ (123/)   → CRM URLs:
    ├── common.urls (field reload, exports, etc.)
    ├── crm.urls (email, request, duplicates, massmails)
    ├── massmail.urls (message preview, send test, etc.)
    └── tasks.urls (task completion, subtask creation)
/{SECRET_ADMIN_PREFIX}/ (456-admin/) → Django admin site
/contact-form/<uuid>/           → Web form submission (LeadSource)
/rosetta/                       → Translation interface
/media/                         → Uploaded files
```

### CRM Views (crm/views/)

| View | Purpose |
|------|---------|
| `create_email` | Create email from Contact/Deal/Lead/Company page |
| `reply_email` | Reply to email |
| `add_request` | Add new customer request |
| `view_original_email` | View full IMAP email |
| `delete_duplicate_object` | Remove duplicate records |
| `change_owner_companies` | Bulk change company owner |
| `contact_form` | Receive web form submissions |

### Common Views (common/views/)

| View | Purpose |
|------|---------|
| `export_objects_view` | Export to Excel (Contact, Company, Lead, Deal, Task) |
| `select_email_account` | Choose email account |
| `select_emails_import` | Select emails to import |
| `reload_field` | AJAX field reloading |
| `user_transfer` | Transfer user's data |
| `copy_department` | Copy user to department |

### Tasks Views (tasks/views/)

| View | Purpose |
|------|---------|
| `create_completed_subtask` | Mark subtask complete |
| `task_completed` | Token-based task completion |
| `email_subtask_completion` | Email-based subtask completion |

---

## 4. AUTHENTICATION & AUTHORIZATION

### Login System
- **URL**: `/admin/login/` (removed from default admin, custom handling)
- **Auth Model**: Django's built-in `auth.User`
- **Middleware**: `AuthenticationMiddleware` + `UserMiddleware` (custom context)

### Permission Decorators

```python
@staff_member_required          # Staff-only (admin=True)
@login_required                 # Login required
```

### User Organization
- **Users**: Django built-in auth.User
- **Departments**: Custom Group extension
- **Roles**: Department membership determines access to department data
- **Tracking**: owner (assigned to), modified_by (last editor)

---

## 5. AUTHENTICATION INTEGRATION

### Email Integration (massmail/)

1. **EmailAccount Model**:
   - SMTP/IMAP configuration
   - Multiple accounts per user
   - OAuth2 support (refresh_token field)
   - Rate limiting (today_count)
   - IMAP UID tracking for synchronization

2. **Email Features**:
   - Incoming email import via IMAP
   - Outgoing via SMTP
   - Threading with UID tracking
   - Email linked to Deal/Request/Contact/Company/Lead
   - Mass mailing with recipient tracking

3. **MailingOut Model**:
   - Track sent/failed/successful recipient IDs
   - Message queue
   - Status: ACTIVE, PAUSED, INTERRUPTED, DONE, ERROR

### VoIP Integration (voip/)

```python
Connection Model:
├── type: pbx, sip, voip
├── number, callerid, provider
└── owner (FK: User)
```

---

## 6. TEMPLATE ORGANIZATION

```
templates/
├── admin/                               # Django admin templates
├── crm/                                 # CRM app templates
│   ├── crm/                             # Email templates
│   ├── crmemail/                        # Email detail templates
│   ├── print_email.html                 # Email printing
│   ├── print_request.html               # Request printing
│   └── addfiles.html                    # File attachment form
├── common/
│   └── common/                          # Export & utility templates
├── admin/ (second level)                # App-specific admin templates
├── crm_colors.html                      # Theme styling
├── crm_help_link.html                   # Help integration
├── language_chooser.html                # Language switcher
├── reload_field_js.html                 # AJAX loader
└── chat_buttons.html                    # Chat interface
```

### Static Files Organization

```
static/
├── css/
├── js/
└── images/

media/
├── docs/                    # Document uploads (date hierarchy)
├── exported/                # Excel exports
├── geodb/                   # Geographic database
├── pics/                    # Images
├── company_logos/           # Company logos (date/time hierarchy)
└── contact_avatars/         # User avatars (date/time hierarchy)
```

---

## 7. ADMIN INTERFACE CUSTOMIZATION

### Custom Admin Site (crm/site/crmadminsite.py)

```python
class CrmAdminSite(BaseSite):
    # Removed default login (custom auth)
    # Added custom import routes:
    path('import_contacts/', ...)       # Import from Excel
    path('import-companies/', ...)      # Import from Excel
    path('import_leads/', ...)          # Import from Excel
```

### Admin Classes (crm/site/)

| Admin | Model |
|-------|-------|
| ContactAdmin | Contact |
| CompanyAdmin | Company |
| LeadAdmin | Lead |
| DealAdmin | Deal |
| RequestAdmin | Request |
| CrmEmailAdmin | CrmEmail |
| PaymentAdmin | Payment |
| ProductAdmin | Product |
| CurrencyAdmin | Currency |
| TagAdmin | Tag |
| CityAdmin | City |
| UserProfileAdmin | UserProfile |
| ReminderAdmin | Reminder |

---

## 8. KEY FEATURES

### Multi-Department Support
- Users grouped by Department (extends auth.Group)
- Department-specific currency, country, work scope (global/local)
- Automatic department assignment to created objects

### Data Relationships
- **Company** is the primary entity - all contacts belong to a company
- **Contact** & **Lead** linked optionally (lead conversion)
- **Deal** connects to Contact/Lead/Company/Request
- **Request** tracks inquiries, optionally linked to Deal
- **CrmEmail** tracks all correspondence across entities

### Activity Tracking
- **workflow** field on Deal/Task logs all changes
- **modified_by** tracks last editor
- **creation_date**, **update_date** on all base objects
- **was_in_touch** date on Contact/Lead/Company

### Excel Import/Export
- **Export**: Contact, Company, Lead, Deal, Task to Excel
- **Import**: Contact/Company/Lead from Excel with duplicacy checking
- Configurable columns per entity (CONTACT_COLUMNS, COMPANY_COLUMNS, etc.)

### IMAP/SMTP Email
- Auto-import incoming emails via IMAP
- Send via multiple SMTP accounts
- Thread emails by message_id and UID
- Track rate limits (today_count)

### Generic Attachments
- Files attached via GenericForeignKey to any model
- ChatMessages as threaded conversations on any object
- Reminders on any model

### Token-Based External Links
- Contact form submissions: `/contact-form/<uuid>/` (LeadSource UUID)
- Task completion: `/tasks/task_completed/<token>/<id>/`
- Unsubscribe: `/massmail/unsubscribe/<token>/`
- Subtask completion: `/tasks/email-subtask_completed/<token>/<id>/`

---

## 9. CURRENT CONFIGURATION

### Database
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',  # Default (MySQL/PostgreSQL available)
        'NAME': 'crm_db',
    }
}
```

### Email
```python
EMAIL_HOST = '<specify host>'           # SMTP host (e.g., smtp.gmail.com)
EMAIL_HOST_USER = 'crm@example.com'     # SMTP username
EMAIL_HOST_PASSWORD = '<specify>'        # SMTP password
EMAIL_PORT = 587
EMAIL_USE_TLS = True
```

### Security
```python
SECRET_KEY = 'j1c=6$s-dh#$...'           # Change in production
DEBUG = True                             # Change to False for production
ALLOWED_HOSTS = ['localhost', '127.0.0.1']  # Add production hosts
SECURE_SSL_REDIRECT = False              # Enable for HTTPS
SESSION_COOKIE_SECURE = False            # Enable for HTTPS
```

### Internationalization
```python
LANGUAGE_CODE = 'en'
TIME_ZONE = 'UTC'                        # Customize in UserProfile
LANGUAGES = [                            # 21 supported languages
    ('ar', 'Arabic'), ('cs', 'Czech'), ('de', 'German'),
    ('en', 'English'), ('es', 'Spanish'), ('fr', 'French'),
    ('ru', 'Russian'), ('zh-hans', 'Chinese'), ...
]
```

---

## 10. MIDDLEWARE STACK

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',          # i18n
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'common.utils.admin_redirect_middleware.AdminRedirectMiddleware',  # Custom
    'common.utils.usermiddleware.UserMiddleware'                       # Custom
]
```

---

## 11. SETTINGS HIERARCHY

```
webcrm/settings.py (main)
├── crm/settings.py (import)           # CONTACT_COLUMNS, COMPANY_COLUMNS, etc.
├── common/settings.py (import)        # REMAINDER_CHECK_INTERVAL, etc.
├── tasks/settings.py (import)         # Task settings
├── voip/settings.py (import)          # VoIP backends configuration
└── webcrm/datetime_settings.py (import)  # Date/time settings
```

---

## 12. SUMMARY

**This is an enterprise-grade Django CRM with:**
- ✅ Multi-app architecture (10+ modules)
- ✅ Complex data relationships (Company → Contact → Deal → Request)
- ✅ Email integration (SMTP/IMAP + mass mailing)
- ✅ Task/project management with subtasks
- ✅ Full I18n (21 languages)
- ✅ Excel import/export
- ✅ Multi-department support
- ✅ VoIP integration
- ✅ Custom admin interface
- ✅ Generic file attachments & chat
- ✅ Token-based external links for forms/surveys

**No REST API found** - admin interface only (no DRF integration)

---

## File Locations Reference

- **Main Settings**: [webcrm/settings.py](webcrm/settings.py)
- **Main URLs**: [webcrm/urls.py](webcrm/urls.py)
- **CRM Models**: [crm/models/](crm/models/)
- **CRM Views**: [crm/views/](crm/views/)
- **CRM Admin**: [crm/site/](crm/site/)
- **Tasks Models**: [tasks/models/](tasks/models/)
- **Email Models**: [massmail/models/](massmail/models/)
- **Base Models**: [common/models.py](common/models.py)
- **Common Views**: [common/views/](common/views/)
- **Templates**: [templates/](templates/)
- **Static**: [static/](static/)
- **Media**: [media/](media/)
