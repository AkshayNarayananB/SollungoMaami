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
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>New comment on your blog!</h3>
          <p><strong>${name}</strong> said:</p>
          <blockquote style="background: #f9f9f9; border-left: 4px solid #2563eb; padding: 10px;">
            "${message}"
          </blockquote>
          <p>
            <a href="${link}" style="background-color: #2563eb; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
              Go to Page
            </a>
          </p>
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
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>You have a new reply!</h3>
          <p><strong>Sollungo Maami</strong> replied to your comment:</p>
          <blockquote style="background: #f9f9f9; border-left: 4px solid #10b981; padding: 10px;">
            "${message}"
          </blockquote>
          <p>
            <a href="${link}" style="background-color: #10b981; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
              View Reply
            </a>
          </p>
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
