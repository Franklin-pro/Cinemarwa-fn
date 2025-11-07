# Film Nyarwanda - Implementation Guide

## Overview
This document provides a comprehensive guide for implementing the Film Nyarwanda digital film platform.

## Current Implementation Status

### ✅ Completed

1. **Security Setup**
   - Moved API key to `.env` file
   - Created `.env.example` for configuration template
   - Configured Vite to use environment variables

2. **Redux Store (State Management)**
   - `src/store/index.js` - Main store configuration
   - `src/store/slices/authSlice.js` - Authentication (login, register, logout)
   - `src/store/slices/movieSlice.js` - Movies (upload, reviews, ratings)
   - `src/store/slices/paymentSlice.js` - Payments (sessions, verification, history)

3. **API Services**
   - `src/services/api/auth.js` - Authentication endpoints
   - `src/services/api/movies.js` - Movie CRUD and reviews
   - `src/services/api/payments.js` - Payment processing and revenue

4. **Authentication Pages**
   - `src/pages/Login.jsx` - Login form with validation
   - `src/pages/Register.jsx` - Registration form with role selection
   - Form validation for email, password, matching

5. **Core Components**
   - `src/components/ProtectedRoute.jsx` - Route protection with role checking
   - `src/components/PermissionGate.jsx` - Access denied UI
   - `src/components/NotificationCenter.jsx` - Notifications display

6. **Routing**
   - Updated `src/App.jsx` with React Router setup
   - Protected and public routes configured
   - Role-based access control

### 🚀 Pending Implementation

1. **User Dashboard Pages**
   - Profile page (`src/pages/Profile.jsx`)
   - Viewer dashboard (`src/pages/dashboard/ViewDashboard.jsx`)
   - Watch movie page (`src/pages/MovieWatch.jsx`)

2. **Filmmaker Features**
   - Filmmaker dashboard (`src/pages/dashboard/FilmmakerDashboard.jsx`)
   - Movie upload form (`src/pages/dashboard/UploadMovie.jsx`)
   - Revenue management
   - Withdrawal system

3. **Admin Features**
   - Admin dashboard (`src/pages/admin/AdminDashboard.jsx`)
   - Movie approval system
   - User management
   - Platform analytics

4. **Movie Features**
   - Complete `ReviewForm.jsx` - Add reviews to movies
   - Complete `ReviewList.jsx` - Display movie reviews
   - Rating system implementation
   - Video player component

5. **Internationalization (i18n)**
   - Setup react-i18next
   - Kinyarwanda translations
   - English translations
   - Language switching

6. **Payment Integration**
   - Stripe integration
   - MTN Mobile Money integration
   - Payment verification flow
   - Refund system

---

## File Structure

```
src/
├── components/
│   ├── Navbar.jsx                 ✅ Complete
│   ├── MovieContent.jsx           ✅ Complete
│   ├── MovieDetails.jsx           ✅ Complete
│   ├── MovieSlider.jsx            ✅ Complete
│   ├── HeroSection.jsx            ✅ Complete
│   ├── GenreSection.jsx           ✅ Complete
│   ├── Footer.jsx                 ✅ Complete
│   ├── ScrollTop.jsx              ✅ Complete
│   ├── VideoPlayer.jsx            ⚠️ Stub
│   ├── ProtectedRoute.jsx         ✅ Complete
│   ├── PermissionGate.jsx         ✅ Complete
│   ├── NotificationCenter.jsx     ✅ Complete
│   ├── ReviewForm.jsx             ⚠️ Stub
│   └── ReviewList.jsx             ⚠️ Stub
├── pages/
│   ├── Login.jsx                  ✅ Complete
│   ├── Register.jsx               ✅ Complete
│   ├── Profile.jsx                ⚠️ Stub
│   ├── MovieDetailsPages.jsx      ⚠️ Stub
│   ├── MovieWatch.jsx             ⚠️ Stub
│   ├── dashboard/
│   │   ├── FilmmakerDashboard.jsx ⚠️ Stub
│   │   ├── UploadMovie.jsx        ⚠️ Stub
│   │   └── ViewDashboard.jsx      ⚠️ Stub
│   └── admin/
│       └── AdminDashboard.jsx     ⚠️ Stub
├── store/
│   ├── index.js                   ✅ Complete
│   └── slices/
│       ├── authSlice.js           ✅ Complete
│       ├── movieSlice.js          ✅ Complete
│       └── paymentSlice.js        ✅ Complete
├── services/
│   ├── api.js                     ✅ Updated (env variables)
│   └── api/
│       ├── auth.js                ✅ Complete
│       ├── movies.js              ✅ Complete
│       └── payments.js            ✅ Complete
├── context/
│   └── MovieProvider.jsx          ✅ Complete
├── App.jsx                        ✅ Updated with routing
└── main.jsx                       ⚠️ Needs Redux provider update
```

---

## Environment Configuration

Create a `.env` file in the project root:

```bash
# TMDB API Configuration
VITE_TMDB_API_KEY=your_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3

# Backend API Configuration
VITE_BACKEND_URL=http://localhost:5000/api

# Payment Gateway Configuration
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
VITE_MTN_MOMO_API_KEY=your_mtn_momo_api_key

# App Configuration
VITE_APP_NAME=Film Nyarwanda
VITE_APP_ENV=development
```

---

## Key Features Implemented

### Authentication Flow
1. User fills registration form
2. Redux `register` thunk sends data to backend
3. Backend returns JWT token
4. Token stored in localStorage
5. User redirected to homepage
6. All API requests include token in headers

### Protected Routes
- Routes check Redux auth state
- If no token, redirect to login
- If token exists but role doesn't match, show PermissionGate
- Works seamlessly with React Router

### State Management
- Redux Toolkit for predictable state
- Three slices: auth, movies, payments
- Async thunks for API calls
- Error and loading states

---

## API Integration Points

### Backend Expected Endpoints

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

**Movies:**
- `GET /api/movies` - List all movies
- `GET /api/movies/:id` - Get movie details
- `POST /api/movies/upload` - Upload new movie (filmmaker)
- `GET /api/movies/user/my-movies` - Filmmaker's movies
- `GET /api/movies/user/purchased` - Viewer's purchased movies
- `GET /api/movies/:id/reviews` - Get movie reviews
- `POST /api/movies/:id/reviews` - Add review
- `POST /api/movies/:id/rating` - Rate movie

**Payments:**
- `POST /api/payments/create-session` - Create payment session
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/purchase` - Purchase movie
- `GET /api/payments/revenue` - Get filmmaker revenue
- `POST /api/payments/withdraw` - Withdraw revenue

---

## Next Steps

### Phase 1: User Dashboards
1. Create Profile page with user info and settings
2. Create Viewer Dashboard with purchased movies
3. Create MovieWatch page with video player
4. Implement ReviewForm and ReviewList components

### Phase 2: Filmmaker Features
1. Create FilmmakerDashboard with analytics
2. Create UploadMovie form with file upload
3. Implement revenue tracking
4. Create withdrawal system

### Phase 3: Admin Features
1. Create AdminDashboard
2. Movie approval workflow
3. User management interface
4. Platform analytics

### Phase 4: Payment & i18n
1. Implement Stripe integration
2. Implement MTN Mobile Money integration
3. Setup i18next for translations
4. Create language switcher

---

## Dependencies Installed

```json
{
  "@reduxjs/toolkit": "^1.x.x",
  "react-redux": "^8.x.x",
  "axios": "^1.x.x",
  "react-router-dom": "^6.x.x",
  "i18next": "^23.x.x",
  "react-i18next": "^13.x.x"
}
```

---

## Security Considerations

✅ **Implemented:**
- API keys in environment variables
- JWT token in localStorage
- Request interceptors add authorization headers
- Protected routes with role checking

⚠️ **To Implement:**
- HTTPS/SSL for production
- CORS configuration on backend
- Rate limiting on API
- Input sanitization
- CSRF protection
- Secure password requirements

---

## Testing

To test the authentication flow:

1. Navigate to `/register`
2. Fill in the form (ensure emails don't match existing)
3. Select role (viewer or filmmaker)
4. Submit - should call backend register endpoint
5. On success, should redirect to home
6. Token should be stored in localStorage

To test protected routes:

1. Logout or clear localStorage
2. Try to access `/dashboard/viewer`
3. Should redirect to `/login`
4. Login, then access dashboard
5. Should show protected content

---

## Troubleshooting

**"Cannot find module" errors:**
- Run `npm install` again
- Clear node_modules and reinstall
- Check import paths are correct

**Redux not updating state:**
- Ensure store is wrapped in Provider in App.jsx
- Check Redux DevTools browser extension

**API calls failing:**
- Verify `.env` variables are set
- Check backend is running on correct port
- Verify CORS is enabled on backend
- Check token is being sent in headers

---

## Resources

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React Router Docs](https://reactrouter.com/)
- [Axios Docs](https://axios-http.com/)
- [i18next Docs](https://www.i18next.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

---

Last Updated: 2025-11-05
Status: In Development
