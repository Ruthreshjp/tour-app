const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const emailTemplates = {
  business_approved: {
    subject: 'Your Business Has Been Approved!',
    html: (businessName) => `
      <h1>Congratulations! Your Business Has Been Approved</h1>
      <p>Dear Business Owner,</p>
      <p>We are pleased to inform you that your business "${businessName}" has been approved on our platform.</p>
      <p>You can now log in to your business dashboard to start managing your listings and accepting bookings.</p>
      <p>Thank you for choosing to partner with us!</p>
    `
  },
  business_rejected: {
    subject: 'Business Application Update',
    html: (businessName) => `
      <h1>Business Application Status Update</h1>
      <p>Dear Business Owner,</p>
      <p>We regret to inform you that your business "${businessName}" application could not be approved at this time.</p>
      <p>Please contact our support team for more information and guidance on how to improve your application.</p>
    `
  },
  new_booking: {
    subject: 'New Booking Request',
    html: (bookingDetails) => `
      <h1>New Booking Request Received</h1>
      <p>Dear Business Owner,</p>
      <p>You have received a new booking request with the following details:</p>
      <ul>
        <li>Date: ${bookingDetails.dateTime}</li>
        <li>Customer Name: ${bookingDetails.customerName}</li>
        ${bookingDetails.pickupLocation ? `<li>Pickup: ${bookingDetails.pickupLocation}</li>` : ''}
        ${bookingDetails.dropLocation ? `<li>Drop: ${bookingDetails.dropLocation}</li>` : ''}
      </ul>
      <p>Please log in to your dashboard to respond to this booking.</p>
    `
  },
  booking_confirmed: {
    subject: 'Booking Confirmed',
    html: (bookingDetails) => `
      <h1>Your Booking is Confirmed!</h1>
      <p>Dear ${bookingDetails.customerName},</p>
      <p>Your booking has been confirmed with the following details:</p>
      <ul>
        <li>Date: ${bookingDetails.dateTime}</li>
        ${bookingDetails.pickupLocation ? `<li>Pickup: ${bookingDetails.pickupLocation}</li>` : ''}
        ${bookingDetails.dropLocation ? `<li>Drop: ${bookingDetails.dropLocation}</li>` : ''}
      </ul>
      <p>Thank you for choosing our service!</p>
    `
  }
};

const sendEmail = async (to, template, data) => {
  try {
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) {
      throw new Error('Email template not found');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html(data)
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail
};