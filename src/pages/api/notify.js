export const prerender = false;
import nodemailer from 'nodemailer';

export const POST = async ({ request }) => {
  const data = await request.json();
  const { type, to, link, message, name } = data;

  const adminEmail = import.meta.env.GMAIL_USER;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: adminEmail,
      pass: import.meta.env.GMAIL_PASS
    }
  });

  let mailOptions = {};

  // SCENARIO 1: mail to admin on comment
  if (type === 'new_comment') {
    mailOptions = {
      from: `"Sollungo Maami Bot" <${adminEmail}>`,
      to: adminEmail, // Send to yourself
      subject: `🔔 New Comment from ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: linear-gradient(135deg, #FFF9E6 0%, #FFF4D6 100%); border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 20px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(255, 165, 0, 0.3);">
            <h3 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);">
              💬 New Comment on Your Blog!
            </h3>
          </div>
          
          <!-- Author -->
          <p style="margin: 0 0 15px 0; color: #FF8C00; font-size: 16px;">
            <strong style="font-size: 18px; color: #FF6B00;">${name}</strong> said:
          </p>
          
          <!-- Comment Block -->
          <blockquote style="background: #ffffff; border-left: 5px solid #FFA500; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08); font-style: italic; color: #333333; line-height: 1.6;">
            "${message}"
          </blockquote>
          
          <!-- Call to Action Button -->
          <div style="text-align: center; margin-top: 30px;">
            <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 8px rgba(255, 165, 0, 0.4); transition: transform 0.2s, box-shadow 0.2s; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);">
              🔗 Go to Page
            </a>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #FFD700; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              This notification was sent because someone commented on your blog.
            </p>
          </div>
      </div>
      `
    };
  } 
  // SCENARIO 2: mail to guest
  else if (type === 'reply' && to) {
    mailOptions = {
      from: `"Sollungo Maami" <${adminEmail}>`,
      to: to,
      subject: "New Reply to your comment!",
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background: linear-gradient(135deg, #FFF9E6 0%, #FFF4D6 100%); border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 20px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(255, 165, 0, 0.3);">
          <h3 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);">
            ✉️ You Have a New Reply!
          </h3>
        </div>
        
        <!-- Author -->
        <p style="margin: 0 0 15px 0; color: #FF8C00; font-size: 16px; line-height: 1.5;">
          <strong style="font-size: 18px; color: #FF6B00;">Sollungo Maami</strong> replied to your comment:
        </p>
        
        <!-- Reply Block -->
        <blockquote style="background: #ffffff; border-left: 5px solid #FFA500; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08); font-style: italic; color: #333333; line-height: 1.6; position: relative;">
          <span style="position: absolute; top: 10px; left: 10px; font-size: 30px; color: #FFD700; opacity: 0.3;">"</span>
          <div style="padding-left: 15px;">
            ${message}
          </div>
          <span style="position: absolute; bottom: 10px; right: 15px; font-size: 30px; color: #FFD700; opacity: 0.3;">"</span>
        </blockquote>
        
        <!-- Call to Action Button -->
        <div style="text-align: center; margin-top: 30px;">
          <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 8px rgba(255, 165, 0, 0.4); transition: transform 0.2s, box-shadow 0.2s; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);">
            👁️ View Reply
          </a>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #FFD700; text-align: center;">
          <p style="margin: 0; color: #999; font-size: 12px;">
            This notification was sent because someone replied to your comment.
          </p>
        </div>
        
      </div>
      `
    };
  } else {
    return new Response(JSON.stringify({ message: "Invalid request" }), { status: 400 });
  }

  //send
  try {
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Email failed:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
