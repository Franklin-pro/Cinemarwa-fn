# Authentication-Based Homepage Setup

## Overview
The MovieWeb application now has a two-tier content system:
- **Guests (Not Logged In)**: See free TMDB trailers and previews
- **Authenticated Users**: Access real movies uploaded to your backend database

## Implementation Details

### 1. **New Components Created**

#### `src/components/UserHomepage.jsx`
A new homepage component exclusively for authenticated users that displays:
- **Hero Section**: Showcases featured content
- **Trending Now**: Most watched movies on the platform (sorted by views)
- **Highly Rated**: Top-rated content from filmmakers (sorted by rating)
- **All Uploaded Movies**: Browse all community-uploaded content

**Key Features:**
- Fetches from backend API: `GET /movies` using `moviesService.getAllMovies()`
- Automatically sorts movies by views and ratings
- Shows loading state while fetching
- Displays error state if movies fail to load
- Movie details modal integration with existing MovieDetails component

### 2. **Updated Components**

#### `src/components/MovieContent.jsx` (Guest Homepage)
Updated the original homepage for guests with:
- **Guest Banner**: Info banner explaining the difference between guest and member content
- **TMDB Content**: Continues to show TMDB trailers and previews
- **Updated Subtitles**: Clearly indicate all content is from TMDB

**Sections:**
- Trending This Week (Free Trailers)
- Latest Movies (From TMDB)
- Upcoming Movies
- Popular Movies (on TMDB)
- Genre Section
- Top Rated Movies

#### `src/components/Navbar.jsx`
Enhanced navigation menu:
- **Authenticated Users**: Show relevant nav items (Trending, Featured, All Movies)
- **Guest Users**: Show traditional nav items (Top Rated, Trending, Popular)
- Navigation items dynamically change based on login status
- Existing auth UI (login/register buttons, profile dropdown) remains unchanged

#### `src/App.jsx`
New routing logic:
- **New HomePage component** that acts as a router:
  ```javascript
  function HomePage() {
    const { token } = useSelector((state) => state.auth);
    return token ? <UserHomepage /> : <MovieContent />;
  }
  ```
- Routes `/` to `<HomePage />` instead of directly to `<MovieContent />`
- All other routes remain unchanged

### 3. **User Flow**

#### For Guest Users:
1. Visit homepage (/)
2. See free TMDB trailers and previews
3. Guest banner prompts to "Sign up or log in"
4. Can browse all TMDB content
5. Click "Watch" on any movie → redirected to login

#### For Logged-In Users:
1. Visit homepage (/)
2. Automatically shown real backend movies
3. See trending, highly-rated, and all uploaded movies
4. Can click on any movie to view details or watch
5. Navbar reflects authenticated state with relevant options

## API Integration

### Backend Movie Endpoints Used:
```javascript
// Get all uploaded movies (with optional filters)
moviesService.getAllMovies({ limit: 50 })
// Returns: { movies: [...], total: number }
```

### Movie Data Structure (from backend):
```javascript
{
  id: string,
  title: string,
  description: string,
  poster_path: string,
  cover_image: string,
  rating: number,
  views: number,
  genre: string[],
  director: string,
  release_date: string,
  // ... other fields
}
```

## Authentication State Management

Uses Redux (already configured):
- **Auth Slice**: `src/store/slices/authSlice.js`
- **State Used**: `token` - determines if user is authenticated
- **localStorage**: Token persists across page refreshes

## Key Features

✅ **Automatic Content Switching**: Based on login status
✅ **Loading States**: Shows loading message while fetching movies
✅ **Error Handling**: Gracefully handles API failures
✅ **Responsive Design**: Works on desktop and mobile
✅ **Movie Details Modal**: Integrated with existing MovieDetails component
✅ **Smart Sorting**: Trending by views, Highly-Rated by rating
✅ **Smooth UX**: No page refresh needed on login/logout

## Testing Checklist

- [ ] Test as guest user - see TMDB content with guest banner
- [ ] Test login - homepage switches to real backend movies
- [ ] Test logout - homepage reverts to TMDB guest content
- [ ] Test movie details modal on both homepages
- [ ] Test navbar navigation items (change based on auth)
- [ ] Test responsive mobile view on both versions
- [ ] Verify loading states when movies are fetched
- [ ] Check error handling when backend is unavailable

## Future Enhancements

1. **Pagination**: Add pagination for all uploaded movies
2. **Filtering**: Add genre/category filters for authenticated users
3. **Favorites**: Let users bookmark favorite movies
4. **Recommendations**: ML-based recommendations for logged-in users
5. **Search**: Backend search for uploaded movies (not just TMDB)
6. **Watch History**: Track what users have watched

## File Changes Summary

| File | Change |
|------|--------|
| `src/App.jsx` | Added HomePage router component, import UserHomepage |
| `src/components/MovieContent.jsx` | Added guest banner, updated subtitles |
| `src/components/UserHomepage.jsx` | **NEW** - Homepage for authenticated users |
| `src/components/Navbar.jsx` | Dynamic nav items based on auth status |

---

**Implementation Date**: 2025-11-06
**Status**: Ready for Testing
