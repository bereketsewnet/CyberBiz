# Contact Page Setup Guide - Backend Email Configuration

This guide will walk you through setting up the Contact Page with email functionality using Laravel's mail system.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Environment Variables Configuration](#environment-variables-configuration)
5. [Email Service Providers](#email-service-providers)
6. [Testing the Contact Form](#testing-the-contact-form)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Contact Page allows users to send messages directly from the website. It uses **Laravel Mail** to send emails from the backend server to a configured email address.

**Features:**
- ✅ Responsive design matching the website theme
- ✅ Form validation (First Name, Last Name, Email, Message)
- ✅ Backend email sending via Laravel Mail
- ✅ Professional HTML email template
- ✅ Contact information display (Phone, Email, Address)

---

## Prerequisites

- Laravel backend server running
- Access to the backend `.env` file
- Email service provider account (Gmail, Outlook, SMTP server, etc.)

---

## Step-by-Step Setup

### Step 1: Configure Email Settings in `.env`

Open the backend `.env` file (`CyberBiz/.env`) and configure the following email settings:

```env
# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

# Contact Form Recipient Email
CONTACT_EMAIL=info@cyberbizafrica.com
```

### Step 2: Common Email Service Configurations

#### Gmail Configuration

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password  # Use App Password, not regular password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="CyberBiz Africa"
CONTACT_EMAIL=info@cyberbizafrica.com
```

**Note:** For Gmail, you need to:
1. Enable 2-Step Verification
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the App Password (16 characters) as `MAIL_PASSWORD`

#### Outlook/Hotmail Configuration

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USERNAME=your-email@outlook.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@outlook.com
MAIL_FROM_NAME="CyberBiz Africa"
CONTACT_EMAIL=info@cyberbizafrica.com
```

#### Custom SMTP Server Configuration

```env
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your-smtp-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="CyberBiz Africa"
CONTACT_EMAIL=info@cyberbizafrica.com
```

#### Mailtrap (For Testing/Development)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=test@cyberbizafrica.com
MAIL_FROM_NAME="CyberBiz Africa"
CONTACT_EMAIL=info@cyberbizafrica.com
```

### Step 3: Clear Configuration Cache

After updating `.env`, clear the configuration cache:

```bash
cd CyberBiz
php artisan config:clear
php artisan cache:clear
```

### Step 4: Test Email Configuration

You can test the email configuration using Laravel Tinker:

```bash
php artisan tinker
```

Then run:
```php
Mail::raw('Test email', function ($message) {
    $message->to('your-test-email@example.com')
            ->subject('Test Email');
});
```

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MAIL_MAILER` | Mail driver to use | `smtp` |
| `MAIL_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP server port | `587` (TLS) or `465` (SSL) |
| `MAIL_USERNAME` | SMTP username/email | `your-email@gmail.com` |
| `MAIL_PASSWORD` | SMTP password/app password | `your-password` |
| `MAIL_ENCRYPTION` | Encryption method | `tls` or `ssl` |
| `MAIL_FROM_ADDRESS` | Default sender email | `noreply@cyberbizafrica.com` |
| `MAIL_FROM_NAME` | Default sender name | `CyberBiz Africa` |
| `CONTACT_EMAIL` | Recipient email for contact form | `info@cyberbizafrica.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MAIL_SCHEME` | Mail scheme | Auto-detected |
| `MAIL_EHLO_DOMAIN` | EHLO domain | Auto-detected from APP_URL |

---

## Email Service Providers

### 1. Gmail (Recommended for Development)

**Pros:**
- Free
- Easy to set up
- Reliable

**Cons:**
- Requires App Password
- Daily sending limits (500 emails/day for free accounts)

**Setup:**
1. Enable 2-Step Verification
2. Generate App Password
3. Use App Password in `MAIL_PASSWORD`

### 2. Custom SMTP Server (Recommended for Production)

**Pros:**
- Professional
- No sending limits (depends on provider)
- Better deliverability

**Cons:**
- Requires hosting/email service
- May have costs

**Setup:**
- Contact your hosting provider for SMTP credentials
- Use cPanel email or dedicated email service

### 3. Mailtrap (For Testing)

**Pros:**
- Perfect for development
- Catches all emails
- No real emails sent

**Cons:**
- Not for production
- Limited free tier

**Setup:**
1. Sign up at https://mailtrap.io
2. Get SMTP credentials
3. Use in `.env` for development

---

## Testing the Contact Form

1. **Fill out the contact form** on the website
2. **Submit the form**
3. **Check the recipient email** (configured in `CONTACT_EMAIL`)
4. **Verify the email** contains:
   - Sender's name and email
   - Message content
   - Reply-to address set to sender's email

---

## Troubleshooting

### Email Not Sending

1. **Check `.env` configuration:**
   ```bash
   php artisan config:clear
   ```

2. **Check Laravel logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

3. **Verify SMTP credentials:**
   - Test with `php artisan tinker`
   - Check if credentials are correct

4. **Check firewall/port:**
   - Ensure port 587 (TLS) or 465 (SSL) is open
   - Check if hosting blocks SMTP

### Common Errors

**"Connection timeout"**
- Check `MAIL_HOST` and `MAIL_PORT`
- Verify firewall allows SMTP connections

**"Authentication failed"**
- Verify `MAIL_USERNAME` and `MAIL_PASSWORD`
- For Gmail, use App Password, not regular password
- Check if 2-Step Verification is enabled (Gmail)

**"Could not instantiate mailer"**
- Run `php artisan config:clear`
- Verify all required `.env` variables are set

### Testing Email Locally

For local development, you can use Mailtrap or log emails:

```env
MAIL_MAILER=log
```

This will log emails to `storage/logs/laravel.log` instead of sending them.

---

## Production Checklist

- [ ] Configure production SMTP server
- [ ] Set `MAIL_FROM_ADDRESS` to your domain email
- [ ] Set `MAIL_FROM_NAME` to your company name
- [ ] Set `CONTACT_EMAIL` to your support/contact email
- [ ] Test email sending from production server
- [ ] Monitor email delivery
- [ ] Set up email queue (optional, for better performance)

---

## Support

If you encounter issues:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Verify `.env` configuration
3. Test SMTP connection with `php artisan tinker`
4. Check email service provider status

---

## Notes

- The contact form sends emails directly from the backend
- No frontend email service (EmailJS) is required
- All emails are sent to the address configured in `CONTACT_EMAIL`
- Reply-to is set to the sender's email for easy responses
- Email template is HTML-formatted and professional
