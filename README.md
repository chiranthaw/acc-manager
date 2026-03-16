# React + Tailwind CSS

This project is a Vite React application configured with Tailwind CSS and Supabase authentication.

After login, the home page shows:

- Player list
- Main team for each player (`1st team`, `2nd team`)
- Membership type for selected year (`full`, `inactive`, `none`)
- Amount to be paid for selected year (default `2000`, whole numbers only)
- Payment progress for selected year (supports installments)
- Add/Edit player modal (name, main team, year, membership, amount)

## Supabase setup

1. Create a Supabase project.
2. Copy [.env.example](.env.example) to `.env.local`.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings.
4. In Supabase Auth settings, ensure Email/Password sign-in is enabled.
5. In Supabase SQL Editor, run [supabase/schema.sql](supabase/schema.sql).
6. If tables already existed, re-run [supabase/schema.sql](supabase/schema.sql) to apply the `main_team`, `amount_due` and `amount_paid` migrations.

## Scripts

- `npm install` to install dependencies
- `npm run dev` to start development server
- `npm run build` to create production build
- `npm run preview` to preview the production build

## Update Supabase send-email function

- npx supabase login
- npx supabase functions deploy send-email --no-verify-jwt

### Resend template setup

Create and publish two templates in your Resend dashboard, then set these Supabase function secrets:

- RESEND_API_KEY
- RESEND_FROM (example: ACC Manager <noreply@yourdomain.com>)
- RESEND_TEMPLATE_MEMBERSHIP_INQUIRY (template id or alias)
- RESEND_TEMPLATE_PAYMENT_REMINDER (template id or alias)

Set secrets:

- npx supabase secrets set RESEND_API_KEY="re_xxx"
- npx supabase secrets set RESEND_FROM="ACC Manager <noreply@yourdomain.com>"
- npx supabase secrets set RESEND_TEMPLATE_MEMBERSHIP_INQUIRY="tmpl_membership_inquiry"
- npx supabase secrets set RESEND_TEMPLATE_PAYMENT_REMINDER="tmpl_payment_reminder"

Deploy after updating secrets:

- npx supabase functions deploy send-email --no-verify-jwt

Template variables expected by this app:

- New Membership Inquiry template variables:
	INQUIRY_NAME, INQUIRY_PHONE, INQUIRY_MESSAGE, SUBMITTED_AT
- Payment Reminder template variables:
	PLAYER_NAME, EMAIL_BODY, AMOUNT_DUE, AMOUNT_PAID, BALANCE_DUE, SEASON_YEAR