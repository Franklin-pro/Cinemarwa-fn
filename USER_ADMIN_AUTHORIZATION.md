# User Admin Panel - Authorization & Security Guide

## Overview

Every user has a personalized admin panel to manage their own movies with **identifier-based authorization**. This ensures users can only access and modify their own content.

---

## Architecture

### Authorization Flow

```
User Logs In
    ↓
JWT Token + User ID stored in Redux
    ↓
Access /admin/movies
    ↓
ProtectedRoute checks authentication
    ↓
UserAdminPanel renders with user.id
    ↓
User can only see/edit movies where movie.userId === user.id
    ↓
All API calls include user.id for backend validation
```

---

## Routes & Authorization

### User Admin Panel Routes

| Route | Component | Protected | Check | Description |
|-------|-----------|-----------|-------|-------------|
| `/admin/movies` | UserAdminPanel | ✅ Yes | Auth | View all user's movies |
| `/admin/movies/:id/edit` | EditMovie | ✅ Yes | Auth + ID | Edit specific movie |
| `/admin/movies/:id/analytics` | MovieAnalytics | ✅ Yes | Auth + ID | View movie analytics |

### Authorization Layers

**Layer 1: Route Protection**
```jsx
<ProtectedRoute>
  <UserAdminPanel />
</ProtectedRoute>
```
- Checks if user is authenticated
- Redirects to `/login` if not

**Layer 2: User ID Verification**
```jsx
// In EditMovie.jsx
if (movie && movie.userId !== user?.id) {
  navigate('/unauthorized');
}
```
- Fetches movie from Redux
- Verifies movie owner matches logged-in user
- Redirects if unauthorized

**Layer 3: Backend Validation**
```
Backend API should verify:
- JWT token is valid
- User ID in token matches movie owner in database
- Return 403 Forbidden if mismatch
```

---

## Implementation Details

### 1. UserAdminPanel (`/src/pages/UserAdminPanel.jsx`)

**Features:**
- Displays all movies for logged-in user
- Filter by status (published, pending, draft, rejected)
- Search functionality
- Table with actions (edit, delete, analytics)
- Statistics cards (total movies, revenue, etc.)

**Authorization:**
```javascript
// Only shows movies where:
const filteredMovies = userMovies?.filter((movie) => {
  // userMovies comes from Redux and is already filtered to user's movies
  // Backend ensures only authenticated user's movies are in this array
  return movie.userId === user.id;
});
```

**Sample Movie Object:**
```javascript
{
  id: "movie_123",
  userId: "user_456",  // ← Owner identifier
  title: "My Great Film",
  description: "...",
  genre: "Drama",
  status: "published",
  views: 1250,
  revenue: 125.50,
  downloadPrice: 4.99,
  watchPrice: 2.99,
  uploadedAt: "2024-11-05T10:30:00Z"
}
```

### 2. EditMovie (`/src/pages/EditMovie.jsx`)

**Authorization Check:**
```javascript
useEffect(() => {
  if (movie && movie.userId !== user?.id) {
    navigate('/unauthorized');
  }
}, [movie, user?.id, navigate]);
```

**What Users Can Edit:**
- ✅ Movie title
- ✅ Description
- ✅ Genre
- ✅ Watch price
- ✅ Download price
- ✅ Visibility status

**What Users CANNOT Edit:**
- ❌ Upload date (set by system)
- ❌ View count (calculated by system)
- ❌ Revenue (calculated by system)
- ❌ Movie ID (immutable)

### 3. MovieAnalytics (`/src/pages/MovieAnalytics.jsx`)

**Authorization Check:**
```javascript
useEffect(() => {
  if (movie && movie.userId !== user?.id) {
    navigate('/unauthorized');
  }
}, [movie, user?.id, navigate]);
```

**Analytics Visible:**
- ✅ Total views
- ✅ Download count
- ✅ Revenue generated
- ✅ Unique viewers
- ✅ Average rating
- ✅ Completion rate
- ✅ Views trend chart
- ✅ Revenue by region

---

## Redux State Management

### Movie State Structure

```javascript
// src/store/slices/movieSlice.js
{
  userMovies: [
    {
      id: "movie_123",
      userId: "user_456",      // Owner identifier
      title: "Film Title",
      status: "published",
      views: 1500,
      revenue: 150.00,
      // ... other properties
    },
    // Only authenticated user's movies
  ],
  loading: false,
  error: null
}
```

### Auth State (provides user.id)

```javascript
// src/store/slices/authSlice.js
{
  user: {
    id: "user_456",           // ← User identifier
    email: "filmmaker@email.com",
    role: "filmmaker",
    firstName: "John",
    lastName: "Doe"
  },
  token: "jwt_token_here",
  loading: false,
  error: null
}
```

### Redux Dispatch Examples

```javascript
// Get user's movies (only their own)
dispatch(getUserMovies());
// Backend must verify user.id and return only that user's movies

// Update movie
dispatch(updateMovie({ id: "movie_123", movieData: {...} }));
// Backend must verify user.id === movie.userId

// Delete movie
dispatch(deleteMovie("movie_123"));
// Backend must verify user.id === movie.userId
```

---

## Backend API Integration

### Required Endpoint Authorization

All endpoints should verify:
1. JWT token is valid
2. User ID in token matches resource owner

#### GET /api/movies/user/my-movies
```
Request:
- Header: Authorization: Bearer <token>

Response:
[
  {
    id: "movie_123",
    userId: "user_456",
    title: "Film Title",
    ...
  }
]

Backend Check:
- Decode JWT → extract user_id
- Return only movies where userId === user_id from token
- Return 401 if token invalid
```

#### PUT /api/movies/:id
```
Request:
- Header: Authorization: Bearer <token>
- Body: { title, description, genre, watchPrice, downloadPrice, ... }

Backend Check:
- Decode JWT → extract user_id
- Find movie by id
- If movie.userId !== user_id → return 403 Forbidden
- If movie.userId === user_id → update and return 200
- Return 401 if token invalid
- Return 404 if movie not found
```

#### DELETE /api/movies/:id
```
Request:
- Header: Authorization: Bearer <token>

Backend Check:
- Decode JWT → extract user_id
- Find movie by id
- If movie.userId !== user_id → return 403 Forbidden
- If movie.userId === user_id → delete and return 200
- Return 401 if token invalid
```

#### GET /api/movies/:id/analytics
```
Request:
- Header: Authorization: Bearer <token>

Backend Check:
- Decode JWT → extract user_id
- Find movie by id
- If movie.userId !== user_id → return 403 Forbidden
- Return analytics data
```

---

## Security Best Practices

### Frontend Security ✅

1. **Protected Routes**
   ```jsx
   <ProtectedRoute>
     <UserAdminPanel />
   </ProtectedRoute>
   ```
   - Checks Redux auth state
   - Redirects to login if not authenticated

2. **ID Verification**
   ```javascript
   if (movie && movie.userId !== user?.id) {
     navigate('/unauthorized');
   }
   ```
   - Verifies movie ownership before rendering
   - Prevents unauthorized access

3. **Token Management**
   - JWT stored in localStorage
   - Included in all API requests
   - Cleared on logout

### Backend Security ⚠️ (Must Implement)

1. **JWT Validation**
   ```javascript
   const decoded = jwt.verify(token, SECRET_KEY);
   const userId = decoded.user_id;
   ```

2. **Ownership Verification**
   ```javascript
   const movie = await Movie.findById(movieId);
   if (movie.userId !== userId) {
     return res.status(403).json({ error: 'Forbidden' });
   }
   ```

3. **Query Filtering**
   ```javascript
   // WRONG: Return all movies
   const movies = await Movie.find();

   // CORRECT: Filter by user
   const movies = await Movie.find({ userId });
   ```

4. **Update Validation**
   ```javascript
   // Only allow updating specific fields
   const allowedUpdates = ['title', 'description', 'genre', 'watchPrice', 'downloadPrice'];
   const updates = {};
   allowedUpdates.forEach(field => {
     if (req.body[field]) {
       updates[field] = req.body[field];
     }
   });
   // Prevent updating: userId, views, revenue, uploadedAt, id
   ```

---

## User Flow Example

### Scenario: Filmmaker edits their movie

```
1. Filmmaker logs in
   └─ Redux stores: user = { id: "filmmaker_123", role: "filmmaker", ... }
   └─ Redux stores: token = "jwt_token_abc123"

2. Navigates to /admin/movies
   └─ ProtectedRoute checks auth ✅
   └─ UserAdminPanel renders

3. Sees list of their 5 movies
   └─ Redux userMovies filtered to filmmaker_123's movies
   └─ Table displays: title, status, views, revenue

4. Clicks "Edit" on movie "My Great Film"
   └─ Navigates to /admin/movies/movie_456/edit
   └─ ProtectedRoute checks auth ✅
   └─ EditMovie component loads

5. EditMovie component:
   └─ Finds movie with id = "movie_456"
   └─ Checks: movie.userId === "filmmaker_123" ✅
   └─ Renders edit form

6. Edits title and downloads price
   └─ Form validation passes
   └─ Dispatches updateMovie action

7. Redux updateMovie thunk:
   └─ Makes PUT request: /api/movies/movie_456
   └─ Includes Authorization header with JWT
   └─ Sends updated data: { title: "...", downloadPrice: 5.99 }

8. Backend receives request:
   └─ Validates JWT ✅
   └─ Extracts user_id = "filmmaker_123"
   └─ Finds movie with id = "movie_456"
   └─ Checks: movie.userId === "filmmaker_123" ✅
   └─ Updates movie in database
   └─ Returns updated movie

9. Frontend receives response:
   └─ Updates Redux state
   └─ Shows success message
   └─ Redirects to /admin/movies
```

---

## Error Handling

### 401 Unauthorized
- Cause: Token expired or invalid
- Frontend: Redirect to `/login`
- Backend: Return 401 with message

### 403 Forbidden
- Cause: User trying to access another user's movie
- Frontend: Redirect to `/unauthorized`
- Backend: Return 403 with message

### 404 Not Found
- Cause: Movie doesn't exist
- Frontend: Show error message
- Backend: Return 404

### 400 Bad Request
- Cause: Invalid input data
- Frontend: Show validation errors
- Backend: Return 400 with error details

---

## Testing Authorization

### Test Case 1: User A cannot access User B's movie

```
1. User A logs in (id: "user_a")
2. Manually navigate to: /admin/movies/user_b_movie_123/edit
3. Expected: Redirect to /unauthorized (movie.userId !== user.id)
```

### Test Case 2: Can only see own movies

```
1. User A logs in (id: "user_a")
2. Navigate to: /admin/movies
3. Expected: See only User A's movies, not User B's
```

### Test Case 3: Cannot edit after logout

```
1. User A is on /admin/movies/movie_123/edit
2. Logout (or token expires)
3. Try to save changes
4. Expected: 401 error → Redirect to /login
```

### Test Case 4: Cannot bypass authorization

```
1. User A logs in
2. Open browser DevTools
3. Try to manually call API: PUT /api/movies/user_b_movie_123
4. Expected: 403 error (backend checks ownership)
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ProtectedRoute                                             │
│    ↓ (checks Redux auth state)                             │
│    ├─→ If no token → redirect /login                       │
│    └─→ If token exists → render component                  │
│         ↓                                                    │
│      UserAdminPanel                                         │
│         ↓                                                    │
│      Redux movieSlice (userMovies)                          │
│      Only contains current user's movies                    │
│         ↓                                                    │
│      Display in table                                       │
│         ↓                                                    │
│      User clicks Edit                                       │
│         ↓                                                    │
│      EditMovie component                                    │
│         ↓                                                    │
│      Verify: movie.userId === user.id                       │
│      ├─→ Match ✅ → Show edit form                          │
│      └─→ No match ❌ → Redirect /unauthorized               │
│         ↓                                                    │
│      User edits and saves                                   │
│         ↓                                                    │
│      Dispatch updateMovie thunk                             │
│         ↓                                                    │
│      Axios PUT request with:                                │
│      - Authorization: Bearer <JWT>                          │
│      - Body: { title, genre, ... }                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                        ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Node/Express)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PUT /api/movies/:id                                        │
│    ↓                                                         │
│  Middleware: Verify JWT                                     │
│    ├─→ Valid ✅ → Extract user_id                           │
│    └─→ Invalid ❌ → Return 401                              │
│         ↓                                                    │
│  Find movie by id in database                               │
│    ├─→ Found → Continue                                     │
│    └─→ Not found → Return 404                               │
│         ↓                                                    │
│  Verify ownership: movie.userId === user_id                 │
│    ├─→ Match ✅ → Update movie                              │
│    └─→ No match ❌ → Return 403                              │
│         ↓                                                    │
│  Save to database                                           │
│    ↓                                                         │
│  Return updated movie (200)                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## API Response Examples

### Success Response
```json
{
  "status": "success",
  "data": {
    "id": "movie_456",
    "userId": "filmmaker_123",
    "title": "My Great Film (Updated)",
    "downloadPrice": 5.99,
    "lastModified": "2024-11-05T15:30:00Z"
  }
}
```

### Unauthorized Response (401)
```json
{
  "status": "error",
  "code": "UNAUTHORIZED",
  "message": "Invalid or expired token. Please log in again."
}
```

### Forbidden Response (403)
```json
{
  "status": "error",
  "code": "FORBIDDEN",
  "message": "You do not have permission to access this movie."
}
```

### Not Found Response (404)
```json
{
  "status": "error",
  "code": "NOT_FOUND",
  "message": "Movie not found."
}
```

---

## Checklist for Implementation

### Frontend ✅
- [x] ProtectedRoute component
- [x] UserAdminPanel with list
- [x] EditMovie with authorization check
- [x] MovieAnalytics with authorization check
- [x] Redux movieSlice
- [x] Error boundaries

### Backend ⏳ (To Implement)
- [ ] JWT validation middleware
- [ ] User ownership verification
- [ ] Query filtering by user ID
- [ ] Update field whitelisting
- [ ] Proper error responses (401, 403, 404)
- [ ] Rate limiting
- [ ] Audit logging

---

## Summary

Each user has a personalized admin panel with **identifier-based authorization**:

1. **Frontend**: Checks `user.id` and `movie.userId`
2. **Backend**: Verifies JWT and movie ownership
3. **Routes**: Protected with authentication
4. **Data**: Only shows user's own movies
5. **Actions**: Edit, delete, view analytics for own movies

This ensures security and prevents unauthorized access to other users' content.

---

**Implementation Status:** Frontend Complete ✅ | Backend Ready for Integration ⏳

For backend implementation questions, refer to the API endpoints section above.
