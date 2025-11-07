# User Admin Panel - Architecture & Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     FILM NYARWANDA PLATFORM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PUBLIC PAGES                    AUTHENTICATED PAGES             │
│  ├─ / (Home)                     ├─ /profile (User Profile)     │
│  ├─ /login                       ├─ /dashboard/viewer           │
│  ├─ /register                    ├─ /dashboard/filmmaker        │
│  └─ /movie/:id                   └─ /dashboard/filmmaker/upload │
│                                                                  │
│  ADMIN PANEL (NEW - Per User)                                   │
│  ├─ /admin/movies                ← View all user's movies      │
│  ├─ /admin/movies/:id/edit       ← Edit user's movie           │
│  └─ /admin/movies/:id/analytics  ← View user's analytics       │
│                                                                  │
│  PLATFORM ADMIN                                                 │
│  └─ /dashboard/admin             ← Site-wide admin            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Admin Panel Component Tree

```
/admin/movies (UserAdminPanel)
│
├─ Header Section
│  ├─ Title & Description
│  └─ Upload New Movie Button
│
├─ Statistics Cards (4 cards)
│  ├─ Total Movies
│  ├─ Published Count
│  ├─ Pending Count
│  └─ Total Revenue
│
├─ Controls
│  ├─ Filter Tabs (All, Published, Pending, Draft)
│  └─ Search Input
│
├─ Movies Table
│  ├─ Headers (Title, Status, Views, Revenue, Date, Actions)
│  ├─ Movie Rows (mapped from Redux.userMovies)
│  │  ├─ Movie Details Cell
│  │  ├─ Status Badge
│  │  ├─ Views Count
│  │  ├─ Revenue Amount
│  │  ├─ Upload Date
│  │  └─ Action Buttons
│  │     ├─ View Analytics → /admin/movies/:id/analytics
│  │     ├─ Edit Movie → /admin/movies/:id/edit
│  │     ├─ Delete Movie (with modal)
│  │     └─ More Options
│  │
│  └─ Empty State (if no movies)
│     └─ Call to Action: Upload First Movie
│
├─ Quick Action Cards (2 cards)
│  ├─ Account Settings Card
│  │  ├─ Payment Methods
│  │  ├─ Withdrawal History
│  │  └─ Account Profile
│  │
│  └─ Help Card
│     ├─ View Documentation
│     └─ Contact Support
│
└─ Delete Confirmation Modal
   ├─ Message: "Are you sure?"
   └─ Cancel / Delete Buttons

───────────────────────────────────────────────────────────────────

/admin/movies/:id/edit (EditMovie)
│
├─ Back Navigation Button
│
├─ Page Header
│  ├─ Title: "Edit Movie"
│  └─ Subtitle: "Update your movie details"
│
├─ Success Message (if applicable)
│
├─ Edit Form
│  ├─ Movie Title Input
│  │  └─ Validation Error (if invalid)
│  │
│  ├─ Description Textarea
│  │  └─ Validation Error (if invalid)
│  │
│  ├─ Genre Select Dropdown
│  │  └─ Validation Error (if invalid)
│  │
│  ├─ Pricing Section (2 columns)
│  │  ├─ Watch Price Input
│  │  │  └─ Validation Error (if invalid)
│  │  │
│  │  └─ Download Price Input
│  │     └─ Validation Error (if invalid)
│  │
│  ├─ Visibility Checkbox
│  │  ├─ Label: "Make Movie Visible"
│  │  └─ Description: "Viewers can see and purchase"
│  │
│  └─ Save Changes Button
│     └─ Loading State: "Saving..."
│
└─ Info Box
   └─ Note about price and visibility changes

───────────────────────────────────────────────────────────────────

/admin/movies/:id/analytics (MovieAnalytics)
│
├─ Back Navigation Button
│
├─ Page Header
│  ├─ Title: Movie Title + " - Analytics"
│  └─ Subtitle: "Track your movie performance"
│
├─ Key Metrics Cards (4 cards)
│  ├─ Total Views Card
│  ├─ Total Downloads Card
│  ├─ Total Revenue Card
│  └─ Unique Viewers Card
│
├─ Charts Section (2 columns)
│  ├─ Views This Week Chart
│  │  └─ Bar chart (7 days)
│  │
│  └─ Revenue Breakdown
│     ├─ Watch Revenue Progress Bar
│     └─ Download Revenue Progress Bar
│
├─ Revenue by Region Table
│  ├─ Region Name
│  ├─ Revenue Amount
│  └─ Progress Bar
│
└─ Additional Metrics (3 cards)
   ├─ Average Rating (5-star visual)
   ├─ Total Watch Time
   └─ Completion Rate
```

---

## Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LOGIN FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User enters email & password                               │
│                    ↓                                             │
│  2. Redux dispatch login({ email, password })                  │
│                    ↓                                             │
│  3. Axios POST /api/auth/login                                 │
│                    ↓                                             │
│  4. Backend validates credentials                              │
│                    ↓                                             │
│  5. Response: { token: "jwt_...", user: {...} }                │
│                    ↓                                             │
│  6. Redux authSlice stores:                                    │
│     ├─ token = "jwt_..."                                        │
│     ├─ user = { id: "user_123", email: "...", ... }            │
│     └─ localStorage.setItem('token', jwt)                       │
│                    ↓                                             │
│  7. User redirected to /                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   ACCESS /ADMIN/MOVIES FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "My Movies"                                    │
│                    ↓                                             │
│  2. Navigate to /admin/movies                                  │
│                    ↓                                             │
│  3. ProtectedRoute component:                                  │
│     ├─ Read Redux auth.token                                    │
│     ├─ Check if token exists                                    │
│     │  ├─ YES → Render UserAdminPanel                          │
│     │  └─ NO → Redirect to /login                              │
│     └─ Read Redux auth.user                                     │
│                    ↓                                             │
│  4. UserAdminPanel mounts:                                     │
│     ├─ dispatch(getUserMovies())                               │
│     └─ Redux movieSlice.userMovies populated                   │
│                    ↓                                             │
│  5. Backend API call:                                          │
│     ├─ GET /api/movies/user/my-movies                          │
│     ├─ Header: Authorization: Bearer <token>                    │
│     └─ Backend validates token & returns only user's movies    │
│                    ↓                                             │
│  6. UserAdminPanel renders:                                    │
│     ├─ Movies table with user's movies                         │
│     ├─ Statistics cards                                         │
│     └─ Action buttons (edit, delete, analytics)                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              EDIT MOVIE AUTHORIZATION FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Edit" on a movie                              │
│                    ↓                                             │
│  2. Navigate to /admin/movies/movie_456/edit                   │
│                    ↓                                             │
│  3. ProtectedRoute checks authentication:                      │
│     ├─ Token exists? YES → Continue                            │
│     └─ Token exists? NO → Redirect to /login                   │
│                    ↓                                             │
│  4. EditMovie component mounts:                                │
│     ├─ Find movie in Redux.movies.userMovies                   │
│     ├─ Get user from Redux.auth.user                           │
│     └─ useEffect: Check ownership                              │
│        ├─ movie.userId === user.id?                            │
│        │  ├─ YES → Render edit form                            │
│        │  └─ NO → Navigate to /unauthorized                    │
│                    ↓                                             │
│  5. User edits form and clicks "Save"                          │
│                    ↓                                             │
│  6. Form validation:                                           │
│     ├─ Check all required fields                               │
│     ├─ Check valid prices (numbers)                            │
│     ├─ Check title not empty                                   │
│     └─ Valid? YES → Continue                                   │
│                    ↓                                             │
│  7. Redux dispatch updateMovie({ id, movieData }):             │
│     ├─ Axios PUT /api/movies/movie_456                         │
│     ├─ Header: Authorization: Bearer <token>                    │
│     └─ Body: { title, genre, prices, ... }                     │
│                    ↓                                             │
│  8. Backend receives request:                                  │
│     ├─ Validate JWT token                                      │
│     ├─ Extract user_id from token                              │
│     ├─ Find movie by id                                        │
│     ├─ Check: movie.userId === user_id?                        │
│     │  ├─ YES → Update and return 200                          │
│     │  └─ NO → Return 403 Forbidden                            │
│     └─ Save to database                                         │
│                    ↓                                             │
│  9. Frontend receives response:                                │
│     ├─ Update Redux state                                      │
│     ├─ Show success message                                    │
│     └─ Redirect to /admin/movies                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│            VIEW ANALYTICS AUTHORIZATION FLOW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User clicks "Analytics" on a movie                         │
│                    ↓                                             │
│  2. Navigate to /admin/movies/movie_456/analytics              │
│                    ↓                                             │
│  3. ProtectedRoute checks authentication:                      │
│     ├─ Token exists? YES → Continue                            │
│     └─ Token exists? NO → Redirect to /login                   │
│                    ↓                                             │
│  4. MovieAnalytics component mounts:                           │
│     ├─ Find movie in Redux.movies.userMovies                   │
│     ├─ Get user from Redux.auth.user                           │
│     └─ useEffect: Check ownership                              │
│        ├─ movie.userId === user.id?                            │
│        │  ├─ YES → Render analytics                            │
│        │  └─ NO → Navigate to /unauthorized                    │
│                    ↓                                             │
│  5. MovieAnalytics renders:                                    │
│     ├─ Metrics cards (views, downloads, revenue)               │
│     ├─ Charts (views trend, revenue breakdown)                 │
│     └─ Regional data                                            │
│                    ↓                                             │
│  6. Backend API call (optional):                               │
│     ├─ GET /api/movies/movie_456/analytics                     │
│     ├─ Header: Authorization: Bearer <token>                    │
│     └─ Backend verifies user_id === movie.userId               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Authorization Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                    MOVIE OWNERSHIP PATTERN                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  movies table:                                                 │
│  ┌─────────────────────────────────────┐                      │
│  │ id  │ userId │ title │ status │ ... │                      │
│  ├─────┼────────┼───────┼────────┼─────┤                      │
│  │ 456 │ 123    │ Film1 │ pub.   │ ... │ ← User 123's movie  │
│  │ 789 │ 123    │ Film2 │ draft  │ ... │ ← User 123's movie  │
│  │ 321 │ 999    │ Film3 │ pub.   │ ... │ ← User 999's movie  │
│  └─────┴────────┴───────┴────────┴─────┘                      │
│                                                                  │
│  When User 123 accesses /admin/movies:                          │
│  ├─ Backend receives: GET /api/movies/user/my-movies           │
│  ├─ JWT contains: user_id = 123                               │
│  ├─ Query: SELECT * FROM movies WHERE userId = 123             │
│  └─ Returns: Movies 456, 789 (User 123's movies)              │
│                                                                  │
│  When User 123 tries to edit movie 321:                         │
│  ├─ Backend receives: PUT /api/movies/321                      │
│  ├─ JWT contains: user_id = 123                               │
│  ├─ Query: SELECT * FROM movies WHERE id = 321                 │
│  ├─ Check: movie.userId (999) === user_id (123)?              │
│  │  NO! → Return 403 Forbidden                                 │
│  └─ Movie NOT updated                                          │
│                                                                  │
│  When User 123 tries to edit movie 456:                         │
│  ├─ Backend receives: PUT /api/movies/456                      │
│  ├─ JWT contains: user_id = 123                               │
│  ├─ Query: SELECT * FROM movies WHERE id = 456                 │
│  ├─ Check: movie.userId (123) === user_id (123)?              │
│  │  YES! → Update allowed                                      │
│  └─ Movie updated → Return 200                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Redux State Structure

```
Redux Store Structure:

store
├─ auth (authSlice)
│  ├─ user
│  │  ├─ id: "user_123"           ← User identifier
│  │  ├─ email: "filmmaker@email"
│  │  ├─ firstName: "John"
│  │  ├─ lastName: "Doe"
│  │  ├─ role: "filmmaker"
│  │  └─ createdAt: "2024-11-05"
│  │
│  ├─ token: "jwt_token_abc123"   ← Used for API auth
│  ├─ loading: false
│  └─ error: null
│
├─ movies (movieSlice)
│  ├─ userMovies: [
│  │  {
│  │    id: "movie_456",
│  │    userId: "user_123",       ← Owner identifier (matches auth.user.id)
│  │    title: "My Film",
│  │    genre: "Drama",
│  │    status: "published",
│  │    views: 1250,
│  │    revenue: 125.50,
│  │    ...
│  │  },
│  │  {
│  │    id: "movie_789",
│  │    userId: "user_123",       ← All movies here belong to logged-in user
│  │    title: "Another Film",
│  │    ...
│  │  }
│  │]
│  │
│  ├─ reviews: { /* Reviews by movie */ }
│  ├─ loading: false
│  └─ error: null
│
└─ payments (paymentSlice)
   ├─ session: null
   ├─ paymentHistory: []
   ├─ loading: false
   ├─ error: null
   └─ success: false
```

---

## Request/Response Cycle

```
Frontend (React)                      Backend (Node/Express)

User navigates to
/admin/movies/:id/edit
        ↓
EditMovie component mounts
        ↓
ProtectedRoute checks auth ✓
        ↓
Check: movie.userId === user.id ✓
        ↓
Render edit form
        ↓
User edits and clicks Save
        ↓
Validate form ✓
        ↓
dispatch(updateMovie({
  id: "movie_456",
  movieData: {
    title: "...",
    genre: "...",
    watchPrice: 2.99,
    downloadPrice: 4.99,
    isVisible: true
  }
}))
        ↓
Axios.put('/api/movies/456', {
  title: "...",
  ...
}, {
  headers: {
    Authorization: 'Bearer jwt_token'
  }
})
        ├─────────────────────────────────────→ PUT /api/movies/456
                                                 ↓
                                        Middleware: Validate JWT
                                                 ├─ Valid? ✓ Extract user_id
                                                 └─ Invalid? ✗ Return 401
                                                 ↓
                                        Router: Find movie by ID
                                                 ├─ Found? ✓ Continue
                                                 └─ Not found? ✗ Return 404
                                                 ↓
                                        Authorization: Check ownership
                                                 ├─ movie.userId === user_id? ✓ Continue
                                                 └─ movie.userId === user_id? ✗ Return 403
                                                 ↓
                                        Update movie in database
                                                 ├─ Success ✓
                                                 └─ Error ✗ Return 500
                                                 ↓
                                        Return 200 OK + Updated movie
        ←─────────────────────────────────────┤
        ↓
Redux action fulfilled
        ↓
Update Redux state
        ↓
Show success notification
        ↓
Redirect to /admin/movies
```

---

## Security Verification Points

```
┌─────────────────────────────────────────────────────────────────┐
│                   SECURITY CHECKS SUMMARY                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FRONTEND SECURITY CHECKS:                                      │
│  ├─ ✅ ProtectedRoute: Check if token exists                   │
│  ├─ ✅ EditMovie: Check if movie.userId === user.id            │
│  ├─ ✅ MovieAnalytics: Check if movie.userId === user.id       │
│  ├─ ✅ Form validation: Prevent invalid data submission        │
│  └─ ✅ Secure token storage: localStorage (with cautions)      │
│                                                                  │
│  BACKEND SECURITY CHECKS (REQUIRED):                            │
│  ├─ ⚠️  JWT validation: Verify token signature & expiry        │
│  ├─ ⚠️  User extraction: Decode user_id from token             │
│  ├─ ⚠️  Ownership check: movie.userId === user_id              │
│  ├─ ⚠️  Field validation: Whitelist allowed fields             │
│  ├─ ⚠️  Error responses: 401, 403, 404, 500                    │
│  ├─ ⚠️  Rate limiting: Prevent brute force                     │
│  ├─ ⚠️  Input sanitization: Prevent SQL injection               │
│  └─ ⚠️  HTTPS enforcement: Encrypted communication              │
│                                                                  │
│  LAYERS OF DEFENSE:                                             │
│  Layer 1 ─ Authentication (Token validation)                   │
│  Layer 2 ─ Authorization (Ownership verification)               │
│  Layer 3 ─ Input Validation (Type & format checking)           │
│  Layer 4 ─ Error Handling (Proper error codes)                 │
│  Layer 5 ─ Logging & Monitoring (Audit trail)                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Organization

```
src/
├── pages/
│   ├── UserAdminPanel.jsx              ← Main admin dashboard
│   ├── EditMovie.jsx                   ← Edit movie form
│   ├── MovieAnalytics.jsx              ← Analytics dashboard
│   └── ... (other pages)
│
├── store/
│   ├── index.js                        ← Store configuration
│   └── slices/
│       ├── authSlice.js                ← Auth state (provides user.id)
│       ├── movieSlice.js               ← Movie state (userMovies)
│       └── paymentSlice.js             ← Payment state
│
├── components/
│   ├── ProtectedRoute.jsx              ← Route protection
│   └── ... (other components)
│
└── App.jsx                             ← Routes setup

Root/
├── USER_ADMIN_AUTHORIZATION.md         ← Authorization guide
├── USER_ADMIN_PANEL_SUMMARY.md         ← Implementation summary
├── ADMIN_PANEL_ARCHITECTURE.md         ← This file (diagrams)
└── ... (other docs)
```

---

**Key Takeaway:**
- Frontend provides UI Layer protection (ProtectedRoute + Ownership checks)
- Backend must provide Data Layer protection (JWT + Ownership verification)
- Together they create a secure, identifier-based authorization system
