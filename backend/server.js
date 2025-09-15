import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'], // Include OPTIONS for preflight
    allowedHeaders: ['Content-Type'],
  })
);
app.use(express.json());

// Test route to verify server is running
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({ message: 'Server is running' });
});

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify Nodemailer configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Nodemailer configuration error:', error.message, error.stack);
  } else {
    console.log('Nodemailer is ready to send emails');
  }
});

// Endpoint to handle email sending
app.post('/api/send-email', async (req, res) => {
  console.log('Received email request:', req.body);
  const { user_name, user_email, message } = req.body;

  // Validate input
  if (!user_name || !user_email || !message) {
    console.error('Validation error: Missing required fields', { user_name, user_email, message });
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user_email)) {
    console.error('Validation error: Invalid email format', { user_email });
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'travelzonnee@gmail.com',
    subject: `New Contact Form Message from ${user_name}`,
    text: `Name: ${user_name}\nEmail: ${user_email}\nMessage: ${message}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${user_name}</p>
      <p><strong>Email:</strong> ${user_email}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to travelzonnee@gmail.com', { user_name, user_email });
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error.message, error.stack);
    res.status(500).json({ error: `Failed to send email: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});