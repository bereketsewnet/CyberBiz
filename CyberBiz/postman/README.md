# Postman Collection for CyberBiz Africa API

This directory contains the Postman collection for testing the CyberBiz Africa API.

## Files

- `CyberBiz_Africa_API.postman_collection.json` - Complete API collection

## Import Instructions

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `CyberBiz_Africa_API.postman_collection.json`
5. Click **Import**

## Environment Setup

The collection uses variables that you can set:

### Collection Variables (Default)
- `base_url`: `http://localhost:8000` (change for production)
- `auth_token`: (set automatically after login)
- `job_id`: (set from responses)
- `product_id`: (set from responses)
- `application_id`: (set from responses)
- `transaction_id`: (set from responses)

### Recommended: Create Postman Environment

1. Click **Environments** in Postman
2. Click **+** to create new environment
3. Name it "CyberBiz Local" or "CyberBiz Production"
4. Add variables:
   - `base_url`: `http://localhost:8000` (or your production URL)
5. Select the environment from dropdown (top right)

## Quick Start

1. **Import the collection**
2. **Set base_url** (collection variable or environment)
3. **Login** using "Authentication > Login" request
   - Use: `seeker1@cyberbiz.africa` / `password123`
   - Copy the `token` from response
   - Set it in `auth_token` variable
4. **Start testing** other endpoints

## Test Credentials

All users use password: `password123`

- **Admin**: `admin@cyberbiz.africa`
- **Employer**: `employer1@cyberbiz.africa`
- **Seeker**: `seeker1@cyberbiz.africa`
- **Learner**: `learner@cyberbiz.africa`

## Endpoint Categories

### ✅ All Endpoints Implemented (35 total)

1. **Authentication** (6 endpoints)
   - Signup, Login, Get User, Logout
   - Google OAuth Redirect & Callback

2. **Job Postings** (6 endpoints)
   - List, Get Details, Get JSON-LD
   - Create, Update, Delete

3. **Applications** (2 endpoints)
   - Apply for Job, List Applications

4. **Files** (2 endpoints)
   - Download CV, Download Payment Proof

5. **Payments** (2 endpoints)
   - Initiate Payment, Upload Proof

6. **Admin - Payments** (3 endpoints)
   - List Pending Payments, Approve, Reject

7. **Products** (3 endpoints)
   - List Products, Get Product Details, Get User Library

8. **Ad Slots** (1 public endpoint)
   - List Active Ad Slots

9. **Admin - Ad Slots** (5 endpoints)
   - List All, Get Details, Create, Update, Delete

### ✅ All Endpoints Implemented!

**Products** (3 endpoints) - ✅ Implemented
- List Products
- Get Product Details
- Get User Library

**Ad Slots** (6 endpoints) - ✅ Implemented
- List Active Ads (Public)
- List All Ads (Admin)
- Get Ad Slot Details (Admin)
- Create Ad Slot (Admin)
- Update Ad Slot (Admin)
- Delete Ad Slot (Admin)

## Usage Tips

### Setting Variables from Responses

1. After login, copy the `token` value
2. Go to collection variables
3. Set `auth_token` = your token
4. Or use Postman's "Set variable" feature in Tests tab

### Testing File Uploads

For endpoints that require file uploads:
1. Select **form-data** or **formdata** body type
2. Change field type to **File**
3. Click **Select Files** and choose your file
4. Ensure file size is under 5MB

### Testing with Different Roles

1. Login with different user credentials
2. Update `auth_token` variable
3. Test role-based access control

## Response Codes

- `200` - Success
- `201` - Created
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

## Notes

- All endpoints return JSON
- Authentication uses Bearer tokens (Sanctum)
- File uploads use multipart/form-data
- UUIDs are used for all IDs
- Pagination is available on list endpoints

## Support

For issues or questions, refer to the main README.md or contact the development team.

