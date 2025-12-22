<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form Submission</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .field {
            margin-bottom: 20px;
        }
        .field-label {
            font-weight: 600;
            color: #667eea;
            margin-bottom: 5px;
        }
        .field-value {
            color: #333;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
        }
        .message-box {
            background: white;
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid #667eea;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">New Contact Form Submission</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">CyberBiz Africa</p>
    </div>
    
    <div class="content">
        <div class="field">
            <div class="field-label">Name</div>
            <div class="field-value">{{ $firstName }} {{ $lastName }}</div>
        </div>
        
        <div class="field">
            <div class="field-label">Email</div>
            <div class="field-value">
                <a href="mailto:{{ $email }}" style="color: #667eea; text-decoration: none;">{{ $email }}</a>
            </div>
        </div>
        
        <div class="field">
            <div class="field-label">Message</div>
            <div class="message-box">
                {!! nl2br(htmlspecialchars($messageText, ENT_QUOTES, 'UTF-8')) !!}
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p>This email was sent from the CyberBiz Africa contact form.</p>
        <p>You can reply directly to this email to respond to {{ $firstName }} {{ $lastName }}.</p>
    </div>
</body>
</html>

