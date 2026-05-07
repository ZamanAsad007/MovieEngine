const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (toEmail, userName, verificationLink) => {
  const safeName = String(userName || "there");

  const mailOptions = {
    from: `"MovieEngine" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your MovieEngine account",
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; background: #0f0f0f; color: #fff; padding: 40px;">
          <div style="max-width: 480px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 40px;">
            <h1 style="color: #e50914; margin-bottom: 8px;">🎬 MovieEngine</h1>
            <h2 style="font-weight: 600; margin-bottom: 16px;">Verify your email</h2>
            <p style="color: #ccc; line-height: 1.6;">
              Hi ${safeName}, thanks for signing up!
              Click the button below to verify your email address
              and activate your account.
            </p>

            <a
              href="${verificationLink}"
              style="
                display: inline-block;
                margin: 24px 0;
                padding: 14px 32px;
                background: #e50914;
                color: #fff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 1rem;
              "
            >
              ✅ Yes, I Confirm — Verify My Email
            </a>

            <p style="color: #666; font-size: 0.85rem;">
              This link expires in 24 hours. If you did not create an account,
              you can safely ignore this email.
            </p>
            <hr style="border-color: #333; margin: 24px 0;" />
            <p style="color: #555; font-size: 0.8rem;">
              If the button doesn't work, copy and paste this link into your browser:
              <br />
              <span style="color: #888; word-break: break-all;">${verificationLink}</span>
            </p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    console.log(`📧 Sending verification email to: ${toEmail}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent successfully to: ${toEmail}`);
    return result;
  } catch (error) {
    console.error(`❌ FAILED to send verification email to ${toEmail}:`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   Response: ${error.response}`);
    throw error;
  }
};

module.exports = { sendVerificationEmail };
