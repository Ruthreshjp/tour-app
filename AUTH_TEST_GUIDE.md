# Authentication Testing Guide

## Current Status

The application has been updated with enhanced authentication debugging and cookie handling for production CORS. This guide will help verify the complete authentication flow is working correctly.

## What Was Fixed

1. **Cookie Configuration**: Updated to use `sameSite: 'none'` for production environments to support cross-origin cookie transmission
2. **PrivateRoute & AdminRoute**: Removed Redux dependency requirement - now always checks with backend regardless of Redux state
3. **Comprehensive Logging**: Added detailed console logs on both frontend and backend to track authentication flow

## Pre-Test Checklist

- [ ] Clear browser cookies and localStorage before testing
- [ ] Use an incognito/private browser window (recommended)
- [ ] Have browser DevTools open (F12) to see console logs
- [ ] Test on production URLs (not localhost)
  - Backend: https://travelzone.onrender.com
  - Frontend: https://travelzone-iota.vercel.app

## Test Scenario 1: User Login Flow

### Steps:
1. Open browser DevTools (F12) and go to Console tab
2. Navigate to login page
3. Enter valid user credentials
4. Submit login form
5. Observe console and verify behavior

### Expected Console Logs (Frontend):

```
✅ Login page submits form
📝 Redux: loginStart action dispatched
✅ POST to /api/auth/login succeeds
📝 Redux: loginSuccess action dispatched
🔐 PrivateRoute: useEffect triggered, currentUser changed to: [user object]
🔐 PrivateRoute: Starting auth check...
🔐 PrivateRoute: currentUser from Redux: [user object]
🔐 PrivateRoute: API_BASE: https://travelzone.onrender.com
🔐 PrivateRoute: Response status: 200
🔐 PrivateRoute auth response: { check: true }
✅ PrivateRoute: Auth check PASSED
🔐 PrivateRoute: Auth passed - rendering Outlet
```

### Expected Behavior:
- User should be redirected to home page (/) with success toast
- If user role is admin (user_role === 1), redirect to /profile/admin
- If user role is normal (user_role === 0), redirect to /

### Backend Console Should Show:
```
🔑 Login: NODE_ENV = production
🔑 Login: Setting production cookies - secure=true, sameSite=none
🔑 Login: Final cookie options: { httpOnly: true, maxAge: 345600000, secure: true, sameSite: 'none' }
🔐 Auth Middleware: Extracting token from request...
🔐 Auth Middleware: req.cookies = { X_TTMS_access_token: '[token]' }
🔐 Auth Middleware: Found token in X_TTMS_access_token cookie
🔐 Auth Middleware: Token verified successfully, user ID: [user_id]
```

---

## Test Scenario 2: Profile Navigation

### Steps (After successful login):
1. User should be on home page (/)
2. Click "Profile" in navigation menu
3. Observe console and verify page loads

### Expected Console Logs (Frontend):

```
🔐 PrivateRoute: useEffect triggered, currentUser changed to: [null or previous user]
🔐 PrivateRoute: Starting auth check...
🔐 PrivateRoute: Rendering Spinner (loading)
🔐 PrivateRoute: Response status: 200
🔐 PrivateRoute auth response: { check: true }
✅ PrivateRoute: Auth check PASSED
🔐 PrivateRoute: Auth passed - rendering Outlet
```

### Expected Behavior:
- Spinner shows briefly while auth check happens
- Profile page loads successfully
- User should see their profile data
- **NOT** redirected back to login page

### Common Issues & Solutions:

**Issue**: Getting `401 Unauthorized` in PrivateRoute check
```
❌ PrivateRoute: Auth check FAILED - check false or missing
🔐 PrivateRoute: Response status: 401
```

**Possible Causes**:
1. Cookie not being sent with credentials
2. Backend not recognizing cookie
3. Browser not storing cookie (mixed HTTP/HTTPS issue)
4. CORS not allowing credentials

**Solution**: Check backend logs for:
- `🔐 Auth Middleware: NO token found in cookies or headers` → Cookie not received
- `🔐 Auth Middleware: Token expired` → Session expired
- `🔐 Auth Middleware: Invalid token signature` → Token mismatch

---

## Test Scenario 3: Admin Login

### Steps:
1. Login with admin credentials (user with user_role = 1)
2. Should redirect to /profile/admin instead of /
3. Verify admin dashboard loads

### Expected Console Logs (Frontend):

```
👮 AdminRoute: useEffect triggered, currentUser changed to: [admin user object]
👮 AdminRoute: Starting admin auth check...
👮 AdminRoute: Response status: 200
👮 AdminRoute auth response: { check: true }
✅ AdminRoute: Auth check PASSED
👮 AdminRoute: Admin auth passed - rendering Outlet
```

### Expected Behavior:
- Admin dashboard should load
- Should NOT see regular user profile
- Should NOT redirect to home page

---

## Test Scenario 4: Logout

### Steps:
1. After login, click Logout button
2. Observe console
3. Try to access /profile/user (should redirect to login)

### Expected Console Logs (Frontend):

```
🔐 PrivateRoute: Auth check PASSED
🔐 PrivateRoute: Response status: 200
🔐 PrivateRoute auth response: { check: true }
[After logout click]
🔐 PrivateRoute: useEffect triggered, currentUser changed to: null
🔐 PrivateRoute: Starting auth check...
🔐 PrivateRoute: Response status: 401
🔐 PrivateRoute: Auth check FAILED - check false or missing
🔐 PrivateRoute: Auth failed - redirecting to login
```

### Expected Behavior:
- Logout succeeds
- Redirected to login page
- Cannot access profile without re-login

---

## Test Scenario 5: Network Tab Analysis

### Steps:
1. Open DevTools Network tab
2. Login
3. Click Profile
4. Monitor requests

### What To Look For:

**Login Request**:
- URL: `https://travelzone.onrender.com/api/auth/login`
- Response Headers should include:
  ```
  Set-Cookie: X_TTMS_access_token=[token]; Path=/; HttpOnly; Secure; SameSite=None
  ```

**Auth Check Request** (to /api/user/user-auth):
- URL: `https://travelzone.onrender.com/api/user/user-auth`
- Request Headers should include:
  ```
  Cookie: X_TTMS_access_token=[token]
  ```
- Status should be `200` with `{"check": true}`

---

## Debugging Commands

### Clear All Application Data:
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
console.log("All data cleared! Reload page.");
```

### Check Redux State:
```javascript
// In browser console (if Redux DevTools installed)
store.getState().user
```

### Check Cookies:
```javascript
// In browser console
document.cookie
```

### Check Backend Logs:
```bash
# On Render dashboard:
# Navigate to your service → Logs
# Look for 🔑, 🔐, and 👮 prefixed messages
```

---

## Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` on /api/user/user-auth | Cookie not sent | Check CORS credentials header |
| `Token verification error` | Invalid JWT | Clear cookies, login again |
| `Session expired` | Token expired after 4 days | Login again |
| `CORS error` | Origin not allowed | Check server.js allowedOrigins |
| `Mixed content warning` | HTTP assets on HTTPS page | Update image URLs to HTTPS |

---

## Next Steps

1. **First Test**: Do a fresh login and monitor console logs
2. **Verify Cookie**: Check if `Set-Cookie` header appears in Network tab
3. **Check Backend Logs**: View Render logs to see middleware messages
4. **Test Profile Navigation**: Navigate away and back to profile page
5. **Test Logout**: Verify logout clears cookie and forces re-login

---

## Report Template

If testing reveals issues, provide:

1. **Exact Issue**: What happens vs what should happen
2. **Console Logs**: Copy relevant console messages (with 🔐, 🔑, or 👮 prefixes)
3. **Network Logs**: Status codes of failed requests
4. **Browser/Environment**: Browser name, OS, incognito/normal
5. **Steps to Reproduce**: Exact steps that caused the issue

---

## Success Indicators

✅ User successfully logs in
✅ No redirect to login after successful login
✅ Profile page loads without 401 errors
✅ Cookie appears in Network tab Set-Cookie header
✅ No CORS errors in console
✅ Logout clears session properly
✅ Re-login works after logout

When all of these pass, authentication is working correctly!
