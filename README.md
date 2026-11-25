# Bulk Mailer · Acme Team (React + Tailwind CSS + Node.js/MySQL)

A comprehensive, pixel-faithful bulk email management platform built with **React**, **React Router DOM**, and **Tailwind CSS**, designed for high deliverability, domain warm-up, campaign lifecycle management, automation series, and compliance.

---

## 🚀 Live Pages & Features (All 17 Screens Included)

1. **Onboarding Empty State Dashboard** (`/` with Onboarding toggle): 5-step go-live setup wizard, empty state cards.
2. **Live Production Dashboard** (`/`): Real-time metrics (Contacts, Sent, Delivered %, Bounced %, Complaints %), Paused campaign progress bar with Resume action, Recent campaigns list, Needs attention widget, Deliverability score widget.
3. **Domain Verification & Warm-up Plan** (`/domains`): SPF, DKIM (3 CNAMEs), DMARC TXT record checks with copy buttons, and 14-day domain warm-up schedule.
4. **Contacts Directory** (`/contacts`): 5 summary stat cards, status filter pills, search bar, contact table with avatars, plans, tags, consent logs, status badges, and pagination.
5. **Contact Profile & Consent Record** (`/contacts/:id`): Individual recipient view with double opt-in verification proof, custom fields, group tags, and activity timeline.
6. **Import Contacts Modal Wizard** (accessible from header/contacts): CSV column mapper, import validation counts (ready, skipped, invalid), group assignment, and legal consent confirmation checkbox.
7. **Groups & Segments Manager** (`/segments`): Static managed groups on the left, auto-updating dynamic rule builder on the right (any/all conditions, events, timeframes, status rules, real-time matching count).
8. **Email Template & Drag-and-Drop Builder** (`/templates`): Block library (Heading, Text, Button, Image, Columns, Divider), Desktop/Mobile responsive preview, block styling inspector (label, URL, color hex, corner radius), and inbox subject preview.
9. **Campaigns Directory** (`/campaigns`): Filter tabs (All, Drafts, Scheduled, Paused, Completed) with interactive actions (Resume, Continue, Review, Report, Duplicate, Resend to non-openers).
10. **Campaign Setup Wizard** (`/campaigns/new` & `/campaigns/:id/edit`): 4-step accordion flow:
    - **1. Inbox Details**: Subject A, A/B test toggle, Subject B with 20% split and auto-winner rule, preview text, sender details.
    - **2. Recipients**: Groups & segments multi-selection with deduplicated audience counter.
    - **3. Content**: Template selector with design editor link and plain-text fallback.
    - **4. When**: Immediate send vs scheduling with date, time, and timezone.
    - **Right Panel**: Live inbox simulation snippet and test email dispatcher with persona selector.
11. **Pre-Send Review & Checklist** (`/campaigns/:id/review`): Pre-flight verification checking SPF/DKIM, DMARC warning with 1-click fix, unsubscribe header, postal address footer, plain-text version, broken links, test email status, sending limits, and suppression list.
12. **Campaign Live Report** (`/campaigns/:id/report`): Real-time progress bar (168 of 942 sent), KPI tiles, link click counter, problems table with retry and profile actions, and live event feed.
13. **Global Deliverability Analytics** (`/analytics`): Time range toggle (7d, 30d, 90d), KPI metrics, emails sent per day bar chart, inbox provider breakdown (Gmail, Yahoo, Outlook, Other) with DMARC recommendation, top links table, and campaign breakdown table with CSV export.
14. **Automations & Drip Workflows** (`/automations`): Automations list with active switches, pre-built workflow templates, and interactive multi-step trigger canvas (Trigger -> Send email -> Wait 3 days -> Condition -> Send follow-up).
15. **System Settings** (`/settings`): Amazon SES rate limit & daily limit configuration, compliance controls (postal address, one-click unsubscribe, double opt-in, preference center), custom contact fields manager, sending domains, sender emails, team members, and audit log.
16. **Public Subscriber Preference Center** (`/preferences`): Standalone customer portal with newsletter preferences, frequency selection, save choices, and opt-out link.
17. **Public Unsubscribe Confirmation** (`/unsubscribed`): Clean confirmation screen with 1-click resubscribe option and feedback survey.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

---

## 🌐 Deploying to Hostinger hPanel

### Step 1: Build the Static Frontend
```bash
npm run build
```
This generates the `dist/` directory.

### Step 2: Hostinger hPanel File Manager
1. Log in to your **Hostinger hPanel**.
2. Navigate to **Websites** &gt; click **Manage** on your domain.
3. Open **File Manager** and enter `public_html`.
4. Upload all the contents inside the `dist/` directory to `public_html`.
5. Note: The build automatically includes `.htaccess` with Apache/OpenLiteSpeed rewrite rules:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```
This ensures React Router DOM client-side routing works smoothly when reloading pages like `/campaigns` or `/contacts`.

---

## 🛠️ Connecting to Node.js & MySQL Backend

The frontend contains an API client service in `src/services/api.js`.

### Environment Variable:
Create a `.env.production` file or set the environment variable in Hostinger:
```env
VITE_API_BASE_URL=https://yourdomain.com/api
```

### Suggested MySQL Database Schema:
- `contacts` (`id`, `name`, `email`, `city`, `plan`, `status`, `consent_source`, `consent_date`, `created_at`)
- `groups` (`id`, `name`)
- `contact_groups` (`contact_id`, `group_id`)
- `campaigns` (`id`, `title`, `subject_a`, `subject_b`, `preview_text`, `status`, `scheduled_at`, `sent_count`, `delivered_count`, `opened_count`, `bounced_count`)
- `campaign_events` (`id`, `campaign_id`, `contact_id`, `event_type`, `user_agent`, `created_at`)
- `templates` (`id`, `name`, `content_json`, `html_body`)
- `domains` (`id`, `domain_name`, `spf_status`, `dkim_status`, `dmarc_status`, `warmup_day`)
