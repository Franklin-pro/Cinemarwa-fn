# 🎬 Dual Homepage Feature - Complete Guide

## 🌟 What's New?

Your MovieWeb application now intelligently displays **two completely different homepages** based on whether users are authenticated:

### Guest Users See:
- **Free TMDB Trailers** and previews
- A promotional banner encouraging sign-up
- Limited to browsing and movie details
- Blocked from watching movies (redirects to login)

### Authenticated Users See:
- **Real uploaded movies** from your backend
- Movies sorted by popularity and ratings
- Full access to watch, review, and rate content
- Personalized experience based on their role

---

## 📸 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  MovieWeb Application                      │
│                                                             │
│  User visits homepage (/)                                 │
│                ↓                                           │
│  Is user logged in?                                       │
│  (Checks Redux auth token)                               │
│         ↓              ↓                                  │
│       YES             NO                                  │
│        ↓               ↓                                  │
│   ┌─────────────┐  ┌──────────────────┐                │
│   │ MEMBER VIEW │  │   GUEST VIEW      │                │
│   │             │  │                    │                │
│   │ Real Movies │  │ TMDB Trailers     │                │
│   │ from        │  │ + Banner saying   │                │
│   │ Backend     │  │ "Sign up to see   │                │
│   │             │  │ more!"            │                │
│   │ Sections:   │  │                    │                │
│   │ • Trending  │  │ Sections:         │                │
│   │ • Rated     │  │ • Trending        │                │
│   │ • All       │  │ • Latest          │                │
│   │   Movies    │  │ • Upcoming        │                │
│   │             │  │ • Popular         │                │
│   │ API:        │  │ • Top Rated       │                │
│   │ /movies     │  │                    │                │
│   │             │  │ API: TMDB         │                │
│   └─────────────┘  └──────────────────┘                │
│         ↓                   ↓                            │
│    [Movies From           [Movies From                  │
│     Your                   Free TMDB                    │
│     Database]              Source]                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### File Changes

#### 1. **src/App.jsx** - Main Router Configuration
```javascript
// NEW: Import components
import UserHomepage from "./components/UserHomepage"
import { useSelector } from 'react-redux'

// NEW: HomePage router component
function HomePage() {
  const { token } = useSelector((state) => state.auth);
  return token ? <UserHomepage /> : <MovieContent />;
}

// CHANGED: Route mapping
<Route path="/" element={<HomePage />} />  // Now routes to HomePage
```

**What it does:**
- Checks if user has authentication token
- If token exists → Shows `UserHomepage` (real movies)
- If no token → Shows `MovieContent` (TMDB trailers)

---

#### 2. **src/components/UserHomepage.jsx** - New Component
```javascript
// Fetches real backend movies
const fetchMovies = async () => {
  const response = await moviesService.getAllMovies({ limit: 50 });
  const movies = response.data.movies;

  // Sort by views (trending)
  setTrendingMovies([...movies].sort((a, b) => (b.views || 0) - (a.views || 0)));

  // Sort by rating (featured)
  setFeaturedMovies([...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0)));
}
```

**Key Features:**
- Loads all uploaded movies from backend
- Automatically sorts by views and ratings
- Shows loading state while fetching
- Displays error if API fails
- Integrates with existing MovieDetails modal

---

#### 3. **src/components/MovieContent.jsx** - Guest Homepage
```javascript
// ADDED: Guest banner section
<section className="bg-gradient-to-r from-blue-900/50 to-purple-900/50">
  <p className="text-white">
    🎬 Enjoy free TMDB trailers & previews •
    <span className="text-blue-400">Sign up or log in to access unlimited movies</span>
  </p>
</section>
```

**Updates:**
- Added promotional banner for guests
- Updated section subtitles to mention TMDB
- All movie content remains from TMDB API
- Encourages users to sign up

---

#### 4. **src/components/Navbar.jsx** - Adaptive Navigation
```javascript
// CHANGED: Navigation items based on auth status
const navItems = isLoggedIn
  ? [
      { id: "home", label: "Home" },
      { id: "trending", label: "Trending" },
      { id: "featured", label: "Featured" },
      { id: "all-movies", label: "All Movies" }
    ]
  : [
      { id: "home", label: "Home" },
      { id: "topRated", label: "Top Rated" },
      { id: "trending", label: "Trending" },
      { id: "popular", label: "Popular" }
    ];
```

**Updates:**
- Different nav items for guests vs members
- Automatically updates when user logs in/out
- Profile dropdown unchanged (already handles auth)

---

## 🎯 User Experience Flow

### New User Landing on Homepage (Guest)
```
1. Homepage ("/") loads
2. App checks auth token (none exists)
3. HomePage component renders MovieContent
4. User sees:
   ✓ TMDB Hero Section
   ✓ Blue banner: "Sign up to access unlimited movies"
   ✓ Trending trailers, Latest movies, etc.
   ✓ Genre section with TMDB content
5. Can click on movies to see details
6. Click "Watch" → Redirected to login
```

### User Registers and Logs In
```
1. User fills register form
2. Backend creates account
3. Redux stores JWT token
4. User redirected to homepage ("/")
5. HomePage detects token in Redux
6. Switches from MovieContent → UserHomepage
7. UserHomepage fetches from /movies API
8. User now sees:
   ✓ Real movies from backend
   ✓ Trending Now (sorted by views)
   ✓ Highly Rated (sorted by rating)
   ✓ All Uploaded Movies
9. Full access to watch and interact
```

### User Logs Out
```
1. User clicks Logout in profile dropdown
2. Redux clears token
3. HomePage component detects no token
4. Switches from UserHomepage → MovieContent
5. User back to viewing TMDB trailers
6. Navbar updates to show Login/Register buttons
```

---

## 📊 Data Structure

### From TMDB API (Guest Content)
```javascript
{
  id: 550,
  title: "Fight Club",
  poster_path: "/...",
  backdrop_path: "/...",
  release_date: "1999-10-15",
  vote_average: 8.8,
  overview: "..."
}
```

### From Backend API (Member Content)
```javascript
{
  id: "movie_123",
  title: "Custom Movie",
  description: "...",
  poster_path: "url_or_path",
  cover_image: "url_or_path",
  rating: 4.5,
  views: 156,
  genre: ["Action", "Drama"],
  director: "John Doe",
  release_date: "2024-01-01"
}
```

---

## 🔄 Data Flow Diagram

### Guest User Path
```
Guest User
    ↓
App.jsx (/ route)
    ↓
HomePage Component
    ↓
Checks: const { token } = useSelector(state => state.auth)
    ↓
Token is null/undefined
    ↓
Renders <MovieContent />
    ↓
MovieContent calls useMovies()
    ↓
MovieProvider fetches TMDB data
    ↓
Shows: Trending, Latest, Popular, etc (TMDB)
```

### Member User Path
```
Member User (has JWT token)
    ↓
App.jsx (/ route)
    ↓
HomePage Component
    ↓
Checks: const { token } = useSelector(state => state.auth)
    ↓
Token exists (JWT)
    ↓
Renders <UserHomepage />
    ↓
UserHomepage useEffect() runs
    ↓
Calls: moviesService.getAllMovies({ limit: 50 })
    ↓
Interceptor adds: Authorization: Bearer {token}
    ↓
Backend validates token, returns user's movies
    ↓
Shows: Trending Now, Highly Rated, All Uploaded
```

---

## 🔐 Security Aspects

### Authentication Check
- Uses Redux auth state (token presence)
- Token stored in localStorage
- Persists across page refreshes
- Cleared on logout

### Protected Routes Still Work
- `/watch/:id` → Requires ProtectedRoute
- `/payment/:movieId` → Requires ProtectedRoute
- `/profile` → Requires ProtectedRoute
- This feature doesn't change that

### Backend Validation
- Token automatically added to /movies API calls
- Backend validates JWT
- Returns only movies user should see
- Invalid/expired tokens rejected

### Role-Based Access
- Admin/Filmmaker specific routes still protected
- UserAdminPanel checks role
- EditMovie checks role
- No changes to existing security

---

## 🚀 How to Use This Feature

### For End Users
1. **Guests**: Browse TMDB trailers freely
2. **Sign Up**: Create account to access real movies
3. **Log In**: See personalized movie collection
4. **Log Out**: Back to TMDB trailers

### For Developers

#### To Add More Sections
Edit `UserHomepage.jsx`:
```javascript
// Add new state
const [documentaryMovies, setDocumentaryMovies] = useState([]);

// In fetch logic
const documentaries = movies.filter(m => m.genre.includes('Documentary'));
setDocumentaryMovies(documentaries.slice(0, 8));

// In JSX
<MovieSlider title="Documentaries" movies={documentaryMovies} />
```

#### To Customize Guest Content
Edit `MovieContent.jsx`:
```javascript
// Change banner message
<p className="text-white">
  Your custom message here
</p>

// Reorder sections
// Change section titles
// Add/remove sections
```

#### To Change Navigation Items
Edit `Navbar.jsx`:
```javascript
const navItems = isLoggedIn
  ? [
      // Add your custom nav items for members
      { id: "my-custom", label: "Custom" }
    ]
  : [
      // Add your custom nav items for guests
    ];
```

---

## ✅ Testing Guide

### Test 1: Guest Experience
```
1. Open app without login
2. Verify MovieContent loads
3. Check guest banner appears
4. Click movie → see details
5. Click watch → redirect to login ✓
```

### Test 2: Login Experience
```
1. Not logged in → see MovieContent
2. Click Register
3. Create account
4. Get redirected to homepage
5. Verify UserHomepage loads
6. See backend movies ✓
```

### Test 3: Navbar Switching
```
1. Not logged in → see Top Rated, Trending, Popular
2. Log in → see Trending, Featured, All Movies
3. Log out → back to original nav items ✓
```

### Test 4: Movie Details
```
1. Guest: Click movie → details modal opens
2. Member: Click movie → details modal opens
3. Both should show movie info ✓
```

### Test 5: Mobile Responsive
```
1. Test on mobile browser
2. Guest homepage should be responsive
3. Member homepage should be responsive
4. Navbar should collapse to hamburger menu ✓
```

### Test 6: Logout & Back
```
1. Log in → see backend movies
2. Logout → go back to TMDB content
3. Homepage switches automatically ✓
```

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Guest seeing member content | Redux token not clearing | Check logout() in authSlice |
| Member seeing guest content | Token not set in Redux | Check login() in authSlice |
| Navigation not updating | Component not re-rendering | Check useSelector dependency |
| Movies not loading | Backend API error | Check VITE_BACKEND_URL |
| Modal not appearing | Missing movie data | Verify API response structure |
| Navbar items wrong | navItems not using isLoggedIn | Verify conditional logic |

---

## 📈 Performance Notes

- **HomePage**: Very lightweight, instant render
- **UserHomepage**: Fetches movies once on mount
- **Bundle Size**: ~2KB additional code
- **Re-renders**: Only when auth token changes
- **Caching**: Movies fetched fresh each load (can optimize with caching)

---

## 🔮 Future Enhancements

### Phase 1: Current State
- ✅ Dual homepage based on auth
- ✅ Guest TMDB content
- ✅ Member backend movies
- ✅ Automatic switching

### Phase 2: Recommendations
- [ ] Personalized suggestions for members
- [ ] "Because you watched..." section
- [ ] Genre-based recommendations
- [ ] User rating influence

### Phase 3: Social
- [ ] Comment on movies
- [ ] Rate movies
- [ ] Follow filmmakers
- [ ] Watch history

### Phase 4: Advanced
- [ ] Machine learning recommendations
- [ ] Trending by genre
- [ ] Personalized collections
- [ ] Watch party features

---

## 📞 Support & Questions

### Need to modify the feature?
1. **Change banner text**: Edit MovieContent.jsx line 20-28
2. **Add movie sections**: Duplicate MovieSlider section in UserHomepage.jsx
3. **Change API endpoint**: Update moviesService in src/services/api/movies.js
4. **Customize sorting**: Modify UserHomepage.jsx fetch logic

### Something broken?
1. Check browser console for errors
2. Verify VITE_BACKEND_URL is correct
3. Ensure backend /movies endpoint is working
4. Check Redux DevTools for auth state

---

## 📚 Related Documentation

- `IMPLEMENTATION_SUMMARY.md` - Technical deep dive
- `QUICK_START_GUIDE.md` - Quick reference guide
- `AUTHENTICATION_HOMEPAGE_SETUP.md` - Full setup details

---

**Feature Status**: ✅ Production Ready
**Last Updated**: November 6, 2025
**Version**: 1.0
