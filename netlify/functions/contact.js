// netlify/functions/contact.js
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);  // Parse the form data
    const { nom, email, message } = body;  // Extract fields

    // 1. Validate the data (server-side)
    if (!nom || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "All fields are required." }),
      };
    }

    // 2. Configure Nodemailer (replace with your email settings)
    const transporter = nodemailer.createTransport({
      host: 'your_smtp_host',  // e.g., 'smtp.gmail.com'
      port: 465,         // or 587
      secure: true,     // true for 465, false for other ports
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_email_password',
      },
    });

    // 3. Compose the email
    const mailOptions = {
      from: 'your_email@gmail.com',
      to: 'recipient_email@example.com', // Your business email
      subject: 'New Contact Form Submission',
      text: `Name: ${nom}\nEmail: ${email}\nMessage: ${message}`,
    };

    // 4. Send the email
    await transporter.sendMail(mailOptions);

    // 5. Send a success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message sent successfully!" }),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send message." }),
    };
  }
};