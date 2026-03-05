import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  playerName?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, x-client-info, apikey',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('OK', {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: EmailPayload = await req.json();

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Resend API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create personalized HTML email template (v2)
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Reminder</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8f9fa;
            padding: 20px;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .subject {
            color: #6b7280;
            font-size: 14px;
            margin-top: 5px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
            color: #4b5563;
        }
        .highlight {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ACC Manager</div>
            <div class="subject">Payment Reminder</div>
        </div>

        <div class="greeting">
            Dear ${payload.playerName || 'Player'},
        </div>

        <div class="content">
            ${payload.html.replace(/\n/g, '<br>')}
        </div>

        <div class="highlight">
            <strong>Important:</strong> Please settle your outstanding membership dues at your earliest convenience.
        </div>

        <div style="text-align: center;">
            <a href="#" class="button">Make Payment</a>
        </div>

        <div class="footer">
            <p>This is an automated message from ACC Manager.</p>
            <p>If you have any questions, please contact your club administrator.</p>
        </div>
    </div>
</body>
</html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ACC Manager <onboarding@resend.dev>',
        to: payload.to,
        subject: payload.subject,
        html: htmlTemplate,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(
        JSON.stringify({ error: `Failed to send email: ${error}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
