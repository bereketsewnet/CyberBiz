# Contact Page Setup Guide

This guide will walk you through setting up the Contact Page with email functionality using EmailJS.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Environment Variables Configuration](#environment-variables-configuration)
5. [EmailJS Account Setup](#emailjs-account-setup)
6. [Testing the Contact Form](#testing-the-contact-form)
7. [Troubleshooting](#troubleshooting)
8. [Alternative Setup (Without EmailJS)](#alternative-setup-without-emailjs)

---

## Overview

The Contact Page allows users to send messages directly from the website. It uses **EmailJS** to send emails from the frontend without requiring a backend server. If EmailJS is not configured, the form will fall back to opening the user's email client.

**Features:**
- ✅ Responsive design matching the website theme
- ✅ Form validation (First Name, Last Name, Email, Message)
- ✅ Direct email sending via EmailJS
- ✅ Fallback to email client if EmailJS is not configured
- ✅ Contact information display (Phone, Email, Address)

---

## Prerequisites

- Node.js and npm installed
- A Gmail, Outlook, or other email account (for EmailJS)
- Access to the project's `.env` file

---

## Step-by-Step Setup

### Step 1: Install Dependencies

The required package (`@emailjs/browser`) should already be installed. If not, run:

```bash
cd CyberBiz_Frontend
npm install @emailjs/browser
```

### Step 2: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** (free account is sufficient)
3. Verify your email address
4. Log in to your EmailJS dashboard

### Step 3: Add Email Service

1. In the EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended for beginners)
   - **Outlook**
   - **Yahoo**
   - Or any other supported provider
4. Follow the provider-specific setup instructions:
   - For Gmail: You'll need to enable "Less secure app access" or use an App Password
   - For Outlook: Use App Password from Microsoft Account settings
5. Give your service a name (e.g., "CyberBiz Contact Form")
6. Click **"Create Service"**
7. **Copy the Service ID** - you'll need this later

### Step 4: Create Email Template

1. In the EmailJS dashboard, go to **"Email Templates"**
2. Click **"Create New Template"**
3. Choose a template or start from scratch
4. Configure the template with these variables:

**Template Settings:**
- **To Email**: Your recipient email (e.g., `info@cyberbizafrica.com`)
- **From Name**: `{{from_name}}`
- **From Email**: `{{from_email}}`
- **Reply To**: `{{reply_to}}`
- **Subject**: `Contact Form Submission from CyberBiz Africa`

**Email Body Template:**
```
Hello,

You have received a new message from the CyberBiz Africa contact form.

Name: {{from_name}}
Email: {{from_email}}

Message:
{{message}}

---
This message was sent from the CyberBiz Africa website contact form.
```

5. Click **"Save"**
6. **Copy the Template ID** - you'll need this later

### Step 5: Get Your Public Key

1. In the EmailJS dashboard, go to **"Account"** → **"General"**
2. Find **"API Keys"** section
3. Copy your **Public Key** (it starts with something like `user_xxxxxxxxxxxxx`)

### Step 6: Configure Environment Variables

1. Navigate to the `CyberBiz_Frontend` directory
2. Create a `.env` file if it doesn't exist (or edit the existing one)
3. Add the following variables:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here

# Contact Email (recipient email address)
VITE_CONTACT_EMAIL=info@cyberbizafrica.com
```

4. Replace the placeholder values with your actual values:
   - `your_service_id_here` → Your EmailJS Service ID (from Step 3)
   - `your_template_id_here` → Your EmailJS Template ID (from Step 4)
   - `your_public_key_here` → Your EmailJS Public Key (from Step 5)
   - `info@cyberbizafrica.com` → Your actual contact email

**Example:**
```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_abcdefghijklmnop
VITE_CONTACT_EMAIL=info@cyberbizafrica.com
```

### Step 7: Restart Development Server

After adding environment variables, you must restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

**Important:** Environment variables are only loaded when the server starts. If you change `.env` while the server is running, you must restart it.

### Step 8: Verify the Setup

1. Open your browser and navigate to `http://localhost:8080/contact`
2. Fill out the contact form:
   - First Name: Test
   - Last Name: User
   - Email: your-email@example.com
   - Message: This is a test message
3. Click **"Submit"**
4. Check your email inbox (the one configured in EmailJS)
5. You should receive the email within a few seconds

---

## Environment Variables Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_EMAILJS_SERVICE_ID` | Your EmailJS service ID | `service_abc123` |
| `VITE_EMAILJS_TEMPLATE_ID` | Your EmailJS template ID | `template_xyz789` |
| `VITE_EMAILJS_PUBLIC_KEY` | Your EmailJS public API key | `user_abcdefghijklmnop` |
| `VITE_CONTACT_EMAIL` | Recipient email address | `info@cyberbizafrica.com` |

### Notes

- All environment variables in Vite must start with `VITE_` to be accessible in the frontend
- Never commit your `.env` file to version control (it should be in `.gitignore`)
- For production, set these variables in your hosting platform's environment settings

---

## EmailJS Account Setup (Detailed)

### Free Tier Limits

EmailJS free tier includes:
- ✅ 200 emails per month
- ✅ Basic email templates
- ✅ All major email providers

### Upgrading (Optional)

If you need more emails:
1. Go to EmailJS dashboard → **"Pricing"**
2. Choose a plan that fits your needs
3. Payment plans start at $15/month for 1,000 emails

---

## Testing the Contact Form

### Test Checklist

- [ ] Form validation works (try submitting empty fields)
- [ ] Email format validation works (try invalid email)
- [ ] Message length validation works (try message less than 10 characters)
- [ ] Successful submission shows success toast
- [ ] Email is received in the configured inbox
- [ ] Email contains all form data correctly
- [ ] Reply-to address is set correctly

### Test Scenarios

1. **Valid Submission:**
   - Fill all fields correctly
   - Submit form
   - Check email inbox

2. **Invalid Email:**
   - Enter invalid email format
   - Should show validation error

3. **Empty Fields:**
   - Leave required fields empty
   - Should show validation errors

4. **Without EmailJS (Fallback):**
   - Remove or comment out EmailJS variables in `.env`
   - Submit form
   - Should open email client with pre-filled data

---

## Troubleshooting

### Problem: "Failed to send message" error

**Solutions:**
1. Check that all environment variables are set correctly
2. Verify EmailJS service is active
3. Check email provider settings (Gmail may require App Password)
4. Restart development server after changing `.env`

### Problem: Emails not being received

**Solutions:**
1. Check spam/junk folder
2. Verify "To Email" in EmailJS template is correct
3. Check EmailJS dashboard → "Activity" for delivery status
4. Verify email service is properly connected

### Problem: Environment variables not working

**Solutions:**
1. Ensure variables start with `VITE_`
2. Restart development server
3. Check for typos in variable names
4. Clear browser cache

### Problem: "Opening your email client..." (Fallback mode)

**This is normal if:**
- EmailJS variables are not set
- EmailJS variables are incorrect
- EmailJS service is not active

**To fix:**
- Follow Steps 2-6 in the setup guide
- Ensure all variables are correct
- Restart the development server

### Problem: CORS errors

**Solution:**
- EmailJS handles CORS automatically
- If you see CORS errors, check browser console for specific issues
- Ensure EmailJS public key is correct

---

## Alternative Setup (Without EmailJS)

If you prefer not to use EmailJS, the contact form will automatically fall back to using the user's email client.

### How It Works

1. User fills out the form
2. Clicks "Submit"
3. Their default email client opens (Gmail, Outlook, etc.)
4. Email is pre-filled with:
   - To: `info@cyberbizafrica.com` (or value from `VITE_CONTACT_EMAIL`)
   - Subject: "Contact Form Submission from CyberBiz Africa"
   - Body: All form data formatted nicely

### Configuration

You only need to set:

```env
VITE_CONTACT_EMAIL=info@cyberbizafrica.com
```

The EmailJS variables can be left empty or omitted.

---

## Production Deployment

### Setting Environment Variables

When deploying to production (Vercel, Netlify, etc.):

1. **Vercel:**
   - Go to Project Settings → Environment Variables
   - Add each variable with its value
   - Redeploy

2. **Netlify:**
   - Go to Site Settings → Environment Variables
   - Add each variable with its value
   - Redeploy

3. **Other Platforms:**
   - Check your platform's documentation for setting environment variables
   - Ensure variables start with `VITE_` for Vite projects

### Security Notes

- ✅ EmailJS Public Key is safe to expose (it's designed for frontend use)
- ✅ Service ID and Template ID are also safe to expose
- ❌ Never expose private keys or sensitive credentials
- ✅ The `.env` file should be in `.gitignore`

---

## Support

If you encounter issues:

1. Check the [EmailJS Documentation](https://www.emailjs.com/docs/)
2. Review the troubleshooting section above
3. Check browser console for error messages
4. Verify all environment variables are set correctly

---

## Quick Reference

### File Locations

- Contact Page: `src/pages/ContactPage.tsx`
- Environment Variables: `.env` (in `CyberBiz_Frontend` directory)
- Route: `/contact`

### Key URLs

- EmailJS Dashboard: [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)
- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)

---

**Last Updated:** January 2025
**Version:** 1.0

