<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject }}</title>
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
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
        }
        .unsubscribe {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0;">{{ $subject }}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">CyberBiz Africa Newsletter</p>
    </div>
    
    <div class="content">
        {!! $content !!}
    </div>
    
    <div class="footer">
        <p>This email was sent from CyberBiz Africa.</p>
        <p>You are receiving this email because you subscribed to our newsletter.</p>
    </div>
    
    <div class="unsubscribe">
        <p>If you no longer wish to receive these emails, you can <a href="{{ config('app.url') }}/unsubscribe?email={{ $email ?? '' }}" style="color: #667eea;">unsubscribe here</a>.</p>
    </div>
</body>
</html>

