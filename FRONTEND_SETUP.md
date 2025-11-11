# Film Nyarwanda - Frontend Setup Guide

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Create .env file with your API keys
cp .env.example .env

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Overview

Film Nyarwanda is a modern React-based digital film platform using:
- **React 19** - UI framework
- **Redux Toolkit** - State management
- **React Router v6** - Navigation
- **Tailwind CSS 4** - Styling
- **Axios** - HTTP client
- **Lucide Icons** - Icons library

---

## Architecture

### Folder Structure

```
src/
├── App.jsx                          # Main app with routing
├── main.jsx                         # Entry point
├── components/                      # Reusable components
│   ├── Navbar.jsx                  # Navigation header
│   ├── MovieContent.jsx            # Main content area
│   ├── MovieSlider.jsx             # Movie carousel
│   ├── HeroSection.jsx             # Hero banner
│   ├── GenreSection.jsx            # Genre browsing
│   ├── VideoPlayer.jsx             # Video player (stub)
│   ├── ReviewForm.jsx              # Review form (stub)
│   ├── ReviewList.jsx              # Reviews display (stub)
│   ├── NotificationCenter.jsx      # Notifications
│   ├── ProtectedRoute.jsx          # Route protection
│   ├── PermissionGate.jsx          # Access denied UI
│   ├── Footer.jsx                  # Footer
│   └── ScrollTop.jsx               # Scroll to top button
│
├── pages/                           # Page components
│   ├── Login.jsx                   # User login
│   ├── Register.jsx                # User registration
│   ├── Profile.jsx                 # User profile
│   ├── MovieDetailsPages.jsx       # Movie details view
│   ├── MovieWatch.jsx              # Video watch page
│   ├── dashboard/                  # Dashboard pages
│   │   ├── ViewDashboard.jsx       # Viewer dashboard
│   │   ├── FilmmakerDashboard.jsx  # Filmmaker dashboard
│   │   └── UploadMovie.jsx         # Movie upload form
│   └── admin/                      # Admin pages
│       └── AdminDashboard.jsx      # Admin panel
│
├── store/                           # Redux store
│   ├── index.js                    # Store configuration
│   └── slices/                     # Redux slices
│       ├── authSlice.js            # Auth state management
│       ├── movieSlice.js           # Movies state
│       └── paymentSlice.js         # Payments state
│
├── services/                        # API services
│   ├── api.js                      # TMDB API integration
│   └── api/                        # Backend API
│       ├── auth.js                 # Auth endpoints
│       ├── movies.js               # Movie endpoints
│       └── payments.js             # Payment endpoints
│
├── context/                         # React Context
│   └── MovieProvider.jsx           # Movie data provider
│
├── hooks/                           # Custom hooks
├── layouts/                         # Layout components
├── assets/                          # Static assets
├── App.css                          # App styles
└── index.css                        # Global styles
```

---

## Key Components

### ProtectedRoute
Protects routes based on authentication and roles.

```jsx
<ProtectedRoute requiredRole="filmmaker">
  <FilmmakerDashboard />
</ProtectedRoute>
```

**Features:**
- Checks if user is authenticated
- Validates user role
- Redirects to login if not authenticated
- Shows PermissionGate if role doesn't match

### Redux Store
Centralized state management for:
- **Auth**: User login/register/logout
- **Movies**: Movie upload, reviews, ratings
- **Payments**: Payment sessions, history, revenue

**Example Usage:**
```jsx
const { user, token, loading } = useSelector(state => state.auth);
const dispatch = useDispatch();

// Dispatch login
dispatch(login({ email, password }));
```

### API Services
Axios instances with automatic token injection:

```jsx
// Auth API
import { authService } from './services/api/auth';
authService.login(credentials);

// Movies API
import { moviesService } from './services/api/movies';
moviesService.uploadMovie(formData);

// Payments API
import { paymentsService } from './services/api/payments';
paymentsService.createPaymentSession(paymentData);
```

---

## Routes

### Public Routes
- `/` - Home page
- `/login` - Login
- `/register` - Registration
- `/movie/:id` - Movie details

### Protected Routes (Authenticated Users)
- `/profile` - User profile
- `/watch/:id` - Watch movie (requires purchase)
- `/dashboard/viewer` - Viewer dashboard

### Filmmaker Routes (Role: filmmaker)
- `/dashboard/filmmaker` - Filmmaker dashboard
- `/dashboard/filmmaker/upload` - Upload movie

### Admin Routes (Role: admin)
- `/dashboard/admin` - Admin dashboard

---

## Authentication Flow

1. **Register**
   - User fills registration form
   - Selects role (viewer/filmmaker)
   - Redux thunk calls backend `/auth/register`
   - JWT token returned and stored in localStorage
   - User redirected to home

2. **Login**
   - User enters email/password
   - Redux thunk calls backend `/auth/login`
   - Token received and stored
   - User redirected to home

3. **Protected Access**
   - ProtectedRoute checks Redux auth state
   - If no token → redirect to `/login`
   - If token exists → render component
   - If role required → check user.role

4. **Logout**
   - User clicks logout button
   - Dispatch `logout()` thunk
   - Token removed from localStorage
   - Redirects to home

---

## Environment Variables

Create `.env` file:

```bash
# TMDB API (for movie browsing)
VITE_TMDB_API_KEY=your_tmdb_key
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3

# Backend API
VITE_BACKEND_URL=http://localhost:5000/api

# Payment Gateways (optional)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_MTN_MOMO_API_KEY=your_key

# App Config
VITE_APP_NAME=Film Nyarwanda
VITE_APP_ENV=development
```

---

## API Integration

### Required Backend Endpoints

All endpoints expect JWT token in `Authorization: Bearer <token>` header.

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

#### Movies
- `GET /api/movies` - List movies
- `POST /api/movies/upload` - Upload movie (filmmaker)
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/:id/reviews` - Get reviews
- `POST /api/movies/:id/reviews` - Add review
- `POST /api/movies/:id/rating` - Rate movie

#### Payments
- `POST /api/payments/create-session` - Create payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Payment history
- `POST /api/payments/purchase` - Purchase movie
- `GET /api/payments/revenue` - Filmmaker revenue

---

## State Management with Redux

### Auth Slice
```jsx
// Login
dispatch(login({ email, password }))

// Register
dispatch(register({
  firstName, lastName, email, password, role
}))

// Logout
dispatch(logout())

// State
{
  user: { id, firstName, lastName, email, role, ... },
  token: 'jwt_token',
  loading: false,
  error: null
}
```

### Movie Slice
```jsx
// Upload movie
dispatch(uploadMovie(formData))

// Get user movies
dispatch(getUserMovies())

// Add review
dispatch(addReview({ movieId, reviewData }))

// Rate movie
dispatch(rateMovie({ movieId, rating }))
```

### Payment Slice
```jsx
// Create payment session
dispatch(createPaymentSession({ movieId, type }))

// Verify payment
dispatch(verifyPayment(transactionId))

// Get payment history
dispatch(getPaymentHistory())
```

---

## Styling with Tailwind CSS

### Theme Colors
- Primary: blue (`from-blue-400 to-blue-500`)
- Background: Dark gray (`gray-950 to black`)
- Accents: blue/blue gradient

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`

### Dark Theme
All components use dark Tailwind colors:
- Backgrounds: `gray-900`, `gray-950`
- Cards: `gray-800/60` with backdrop blur
- Text: `text-white`, `text-gray-400`

---

## Component Examples

### Login Page
- Email and password fields with validation
- Show/hide password toggle
- Error message display
- Redirect on successful login

### Register Page
- Name, email, password fields
- Password confirmation matching
- Role selection (Viewer/Filmmaker)
- Form validation

### Protected Route
- Checks authentication
- Checks role if specified
- Redirects to login if needed

### Profile Page
- Display user information
- Logout button
- Edit profile link
- Change password button

---

## Common Issues & Solutions

### Issue: "Cannot find module"
**Solution:** Run `npm install` and check import paths

### Issue: Redux state not updating
**Solution:**
- Ensure Provider wraps App
- Check Redux DevTools browser extension
- Verify thunk is dispatched

### Issue: API calls failing
**Solution:**
- Check `.env` variables are set correctly
- Verify backend is running
- Check CORS is enabled
- Verify token is in localStorage

### Issue: Styles not applying
**Solution:**
- Rebuild with `npm run build`
- Check Tailwind CSS is properly configured
- Verify class names are correct

---

## Testing

### Local Testing
1. Start dev server: `npm run dev`
2. Navigate to http://localhost:5173
3. Register/login
4. Navigate protected routes

### Testing Protected Routes
```javascript
// Logout first
localStorage.removeItem('token')

// Try to access protected route
// Should redirect to login
```

### Testing Role-based Access
```javascript
// Login as viewer
// Try to access /dashboard/filmmaker
// Should show PermissionGate
```

---

## Performance Tips

1. **Code Splitting**
   - Use React.lazy() for page components
   - Implement Suspense boundaries

2. **Image Optimization**
   - Use next-gen formats (WebP)
   - Lazy load images

3. **Bundle Size**
   - Monitor with `npm run build --report`
   - Remove unused dependencies

4. **Caching**
   - Cache API responses
   - Use localStorage for tokens

---

## Deployment

### Build
```bash
npm run build
```

### Deploy to Vercel/Netlify
```bash
# Vercel
vercel deploy

# Netlify
netlify deploy --prod --dir=dist
```

### Environment Variables in Production
Set these in your deployment platform:
- `VITE_TMDB_API_KEY`
- `VITE_BACKEND_URL`
- `VITE_STRIPE_PUBLIC_KEY`
- etc.

---

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

---

## Resources

- [React Docs](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [Lucide Icons](https://lucide.dev/)

---

## Contributing

When adding new features:
1. Create feature branch
2. Add/update components
3. Update Redux store if needed
4. Test protected routes
5. Submit PR

---

## License

MIT License - See LICENSE file for details

---

**Last Updated:** November 5, 2025
**Status:** In Active Development
