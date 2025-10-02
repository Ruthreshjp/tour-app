// backend/utils/emailTemplates.js

export const generateBookingConfirmationEmail = (booking, unitDetails) => {
  const formatDate = (date) => new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let unitInfo = '';
  let timingInfo = '';

  switch (booking.businessType) {
    case 'hotel':
      unitInfo = `Room Number: ${unitDetails.roomNumber}
Type: ${unitDetails.type}
Floor: ${unitDetails.floor}`;
      timingInfo = `Check-in: ${formatDate(booking.bookingDetails.checkIn)}
Check-out: ${formatDate(booking.bookingDetails.checkOut)}`;
      break;

    case 'restaurant':
      unitInfo = `Table Number: ${unitDetails.tableNumber}
Section: ${unitDetails.section}
Capacity: ${unitDetails.capacity} persons`;
      timingInfo = `Reservation Date: ${formatDate(booking.bookingDetails.reservationDate)}`;
      break;

    case 'cab':
      unitInfo = `Vehicle: ${unitDetails.model}
Vehicle Number: ${unitDetails.vehicleNumber}
Driver Name: ${unitDetails.driverDetails.name}
Driver Phone: ${unitDetails.driverDetails.phone}`;
      timingInfo = `Pickup Time: ${formatDate(booking.bookingDetails.pickupTime)}
Pickup Location: ${booking.bookingDetails.pickupLocation}
Drop Location: ${booking.bookingDetails.dropLocation}`;
      break;
  }

  return {
    subject: `Booking Confirmation - ${booking.businessType.charAt(0).toUpperCase() + booking.businessType.slice(1)} Reservation`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Booking Confirmation</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #334155; margin-top: 0;">Booking Details</h3>
          <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${booking._id}</p>
          <p style="margin: 5px 0;"><strong>Verification Code:</strong> ${booking.verificationCode}</p>
          <p style="color: #64748b; font-size: 14px;">Please keep this code handy for verification during check-in</p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #334155; margin-top: 0;">Unit Details</h3>
          <pre style="margin: 0; font-family: Arial, sans-serif;">${unitInfo}</pre>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #334155; margin-top: 0;">Timing Details</h3>
          <pre style="margin: 0; font-family: Arial, sans-serif;">${timingInfo}</pre>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #334155; margin-top: 0;">Customer Information</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${booking.customerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${booking.customerEmail}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${booking.customerPhone}</p>
        </div>

        <div style="margin-top: 20px; font-size: 14px; color: #64748b;">
          <p>If you have any questions or need to make changes to your booking, please contact us.</p>
          <p>Thank you for choosing our service!</p>
        </div>
      </div>
    `
  };
};