const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/emailService');

// Send notification email
router.post('/send-email', async (req, res) => {
  try {
    const { type, businessId, bookingDetails } = req.body;
    const business = await Business.findById(businessId);
    
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const emailResult = await sendEmail(
      business.email,
      type,
      type === 'new_booking' ? bookingDetails : business.businessName
    );

    if (emailResult.success) {
      res.json({ success: true, message: 'Notification sent successfully' });
    } else {
      throw new Error(emailResult.error);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;