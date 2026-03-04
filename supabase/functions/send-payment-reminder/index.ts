// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface PaymentReminderRequest {
  playerId: string;
  year: number;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { playerId, year }: PaymentReminderRequest = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get player details and payment info
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('full_name, email')
      .eq('id', playerId)
      .single()

    if (playerError || !player?.email) {
      return new Response('Player not found or no email', { status: 404 })
    }

    const { data: paymentStatus, error: paymentError } = await supabase
      .from('player_year_status')
      .select('amount_due, amount_paid, membership_type')
      .eq('player_id', playerId)
      .eq('year', year)
      .single()

    if (paymentError) {
      return new Response('Payment status not found', { status: 404 })
    }

    const amountDue = paymentStatus.amount_due - paymentStatus.amount_paid

    if (amountDue <= 0) {
      return new Response('Payment is already complete', { status: 400 })
    }

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response('Email service not configured', { status: 500 })
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ACC Manager <noreply@yourdomain.com>', // Replace with your domain
        to: [player.email],
        subject: `Payment Reminder - ACC Membership ${year}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Payment Reminder</h2>
            <p>Dear ${player.full_name},</p>
            <p>This is a reminder that you have an outstanding payment for your ACC membership.</p>
            <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <p><strong>Year:</strong> ${year}</p>
              <p><strong>Membership Type:</strong> ${paymentStatus.membership_type}</p>
              <p><strong>Amount Due:</strong> $${amountDue}</p>
            </div>
            <p>Please make your payment as soon as possible to maintain your membership status.</p>
            <p>If you have already made the payment, please disregard this email.</p>
            <p>Best regards,<br>ACC Management Team</p>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Payment reminder sent successfully' }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error('Error sending payment reminder:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to send payment reminder' }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-payment-reminder' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
