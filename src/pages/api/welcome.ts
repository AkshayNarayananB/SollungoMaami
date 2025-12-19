export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email missing" }), { status: 400 });
    }

    // --- EMAIL TEMPLATE ---
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fffbeb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.15); border: 1px solid #fcd34d; }
        .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .content { padding: 40px 30px; color: #4b5563; line-height: 1.6; }
        .greeting { font-size: 22px; font-weight: bold; color: #d97706; margin-bottom: 20px; }
        .divider { height: 2px; background-color: #fef3c7; margin: 25px 0; width: 50px; }
        .highlight { color: #d97706; font-weight: 600; }
        .button-container { text-align: center; margin-top: 35px; }
        .button { background-color: #f59e0b; color: #ffffff !important; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; transition: background 0.3s; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2); }
        .button:hover { background-color: #d97706; }
        .footer { background-color: #fff7ed; padding: 20px; text-align: center; font-size: 12px; color: #92400e; border-top: 1px solid #ffedd5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome Home! 🧡</h1>
        </div>
        <div class="content">
          <div class="greeting">Vanakkam! You're officially in.</div>
          
          <p>Thank you so much for joining the <strong>Sollungo Maami</strong> family. It warms my heart to have you here.</p>
          
          <div class="divider"></div>

          <p>You have just signed up for the best seat in the house. Here is what you can look forward to:</p>
          <ul>
            <li>✨ <strong>Fresh Updates:</strong> Be the first to know when a new recipe or story drops.</li>
            <li>💌 <strong>Monthly Newsletter:</strong> A curated roundup of our best moments, tips, and hidden gems.</li>
          </ul>

          <p>So sit back, grab a cup of filter coffee ☕, and get ready for some flavor.</p>
          
          <div class="button-container">
            <a href="https://sollungomaami.com" class="button">Visit the Blog</a>
          </div>
        </div>
        <div class="footer">
          <p>Sent with love and spices from Sollungo Maami 🧡</p>
        </div>
      </div>
    </body>
    </html>
    `;

    await resend.emails.send({
      from: 'Sollungo Maami <welcome@sollungomaami.com>',
      to: email,
      subject: "Welcome to the family! 🧡",
      html: htmlContent
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (e) {
    console.error("Welcome email error:", e);
    // Return 200 even on error so we don't break the frontend UI flow
    return new Response(JSON.stringify({ error: 'Failed to send' }), { status: 200 }); 
  }
};
