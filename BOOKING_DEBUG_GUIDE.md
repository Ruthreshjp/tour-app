# Hotel Booking Debug Guide

## Issue
Hotel bookings from TravelOwn component are not appearing in the business booking page (pending column).

## What I've Added

### Enhanced Logging in Backend

#### 1. `createBooking` Function (booking.controller.js)
Now logs:
- Business ID and its type when booking is created
- User ID making the booking
- Business details (name, ID) after validation
- Stored businessId in the database after save
- Complete booking details

#### 2. `getBusinessBookings` Function (booking.controller.js)
Now logs:
- Business ID from authentication middleware
- Total bookings in database
- All booking businessIds for comparison
- Matched bookings count
- Similar bookings if exact match not found

## How to Test

### Step 1: Create a Test Booking
1. **Start backend**: `cd backend && npm start`
2. **Start frontend**: `cd client && npm run dev`
3. **Login as a regular user** (not business)
4. **Go to TravelOwn** → Hotels
5. **Select a hotel** and click "Book Now"
6. **Fill booking form** and submit

### Step 2: Check Backend Console
Look for these logs in the backend console:

```
🎫 CREATE BOOKING REQUEST:
   Business ID: [some-id]
   Business ID type: string
   User ID: [user-id]
   Business Type: hotel
   ...
✅ Business found: [Business Name] ( [business-id] )
✅ Booking created successfully:
   Booking ID: [booking-id]
   Stored businessId: [business-id]
   Status: pending
```

**Important**: Note the `Stored businessId` value!

### Step 3: Login as Business Owner
1. **Logout** from user account
2. **Login to business account** (the hotel you booked)
3. **Go to Business Dashboard** → Bookings

### Step 4: Check Backend Console Again
Look for these logs:

```
📋 Get business bookings request received
🏢 Business ID from middleware: [business-id]
📊 Total bookings in database: X
📊 All booking businessIds: [array of all bookings]
✅ Found X bookings for business [business-id]
```

## What to Look For

### ✅ Success Indicators:
- `Stored businessId` matches `Business ID from middleware`
- `Found X bookings` shows count > 0
- Bookings appear in the UI

### ❌ Problem Indicators:

#### Problem 1: IDs Don't Match
```
Stored businessId: 507f1f77bcf86cd799439011
Business ID from middleware: 507f1f77bcf86cd799439012
```
**Solution**: Business IDs are different - user booked wrong hotel

#### Problem 2: No Bookings Found
```
📊 Total bookings in database: 5
✅ Found 0 bookings for business [id]
```
**Solution**: Check the `All booking businessIds` array to see where bookings went

#### Problem 3: Authentication Issue
```
❌ No business ID found in request
```
**Solution**: Business authentication middleware failing - check businessToken cookie

## Common Issues & Solutions

### Issue 1: Booking Created but Not Showing
**Symptom**: Booking created successfully, but business sees 0 bookings

**Possible Causes**:
1. **Wrong business logged in**: User booked Hotel A, but logged into Hotel B
2. **businessId mismatch**: Frontend sending wrong hotel ID
3. **Status filter**: BookingManager filtering by wrong status

**Debug Steps**:
1. Check backend logs for `Stored businessId` vs `Business ID from middleware`
2. Verify they match exactly
3. Check `All booking businessIds` array to find where booking went

### Issue 2: Authentication Failing
**Symptom**: Business login works, but booking page shows error

**Possible Causes**:
1. businessToken cookie not set
2. Token expired
3. Business account deactivated

**Debug Steps**:
1. Check browser DevTools → Application → Cookies → businessToken
2. Check backend logs for "Business auth" messages
3. Verify business.isActive = true in database

### Issue 3: Frontend Not Sending Correct Data
**Symptom**: Backend logs show wrong businessId

**Possible Causes**:
1. HotelBooking component using wrong hotel object
2. hotel._id is undefined
3. Multiple hotel objects in state

**Debug Steps**:
1. Check HotelBooking.jsx console logs (already present)
2. Verify `hotel._id` is correct
3. Check if hotel prop is passed correctly

## Quick Fix Checklist

- [ ] Backend server running on port 8000
- [ ] Frontend running on port 5175
- [ ] User logged in (not business)
- [ ] Hotel selected has valid _id
- [ ] Booking form submitted successfully
- [ ] Backend logs show "Booking created successfully"
- [ ] Business owner logged in (correct hotel)
- [ ] Business token cookie present
- [ ] Backend logs show "Get business bookings request"
- [ ] businessId in logs matches between create and fetch

## Next Steps

After testing with the enhanced logging:

1. **Share the backend console logs** showing:
   - The booking creation logs
   - The business bookings fetch logs

2. **Share the browser console logs** from:
   - HotelBooking component (when creating booking)
   - BookingManager component (when fetching bookings)

3. **Verify in MongoDB** (optional):
   ```javascript
   // In MongoDB shell or Compass
   db.bookings.find({}).pretty()
   db.businesses.find({}).pretty()
   ```

This will help identify exactly where the issue is occurring!
