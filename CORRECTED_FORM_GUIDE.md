# Movie Upload Form - Corrected Guide

## Issues Fixed

### 1. **"title" is required Error**
**Problem:** Form was sending `title` as part of `formData` but validation was failing.
**Solution:** Ensure `title` is properly included in the request body and is a non-empty string.

### 2. **Arrays Being Sent as Strings**
**Problem:** `tags`, `keywords`, and `categories` were being sent as comma-separated strings instead of arrays.
**Solution:**
- Send them as arrays in JSON
- Or send as comma-separated strings and use the `parseFormData()` helper to convert them

### 3. **File Uploads as URLs Instead of Files**
**Problem:** You want to send video, poster, and backdrop as URLs (not file uploads).
**Solution:** Send them as string URLs, not files. Remove file upload fields.

---

## Corrected Frontend Form Example

### React Component

```jsx
import React, { useState } from 'react';
import { moviesService } from '../services/api/movies';

const MovieUploadForm = () => {
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    original_title: '',
    overview: '',
    release_date: '',
    language: 'en',

    // URLs (not files!)
    poster: '',
    backdrop: '',
    thumbnail: '',
    videoUrl: '',
    streamingUrl: '',
    hlsUrl: '',

    // Metadata
    videoQuality: '720p',
    videoDuration: '',
    price: 0,
    currency: 'USD',
    royaltyPercentage: 70,

    // Categories & Tags
    categories: [],
    tags: [],
    keywords: [],

    // Download Settings
    allowDownload: true,
    downloadExpiry: 30,
  });

  const [errors, setErrors] = useState({});

  // Handle text/number inputs
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle array fields (categories, tags, keywords)
  const handleArrayChange = (field, value) => {
    // Convert comma-separated string to array
    const arrayValue = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');

    setFormData((prev) => ({
      ...prev,
      [field]: arrayValue,
    }));
  };

  // Handle category selection (checkboxes)
  const handleCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send as JSON (not formData) since we're not uploading files
      const response = await moviesService.uploadMovie(formData);
      console.log('Movie uploaded:', response);
      alert('Movie uploaded successfully!');

      // Reset form
      setFormData({
        title: '',
        original_title: '',
        overview: '',
        release_date: '',
        language: 'en',
        poster: '',
        backdrop: '',
        thumbnail: '',
        videoUrl: '',
        streamingUrl: '',
        hlsUrl: '',
        videoQuality: '720p',
        videoDuration: '',
        price: 0,
        currency: 'USD',
        royaltyPercentage: 70,
        categories: [],
        tags: [],
        keywords: [],
        allowDownload: true,
        downloadExpiry: 30,
      });
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({
        submit: error.response?.data?.error || 'Failed to upload movie',
      });
    }
  };

  const categories = [
    'Action',
    'Comedy',
    'Drama',
    'Horror',
    'Thriller',
    'Romance',
    'Documentary',
    'Animation',
    'Sci-Fi',
    'Fantasy',
  ];

  return (
    <form onSubmit={handleSubmit} className="movie-upload-form">
      <h2>Upload Movie</h2>

      {/* Basic Information */}
      <div className="form-section">
        <h3>Basic Information</h3>

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Enter movie title"
          />
          {errors.title && <span className="error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="original_title">Original Title</label>
          <input
            type="text"
            id="original_title"
            name="original_title"
            value={formData.original_title}
            onChange={handleInputChange}
            placeholder="Original title if different"
          />
        </div>

        <div className="form-group">
          <label htmlFor="overview">Overview</label>
          <textarea
            id="overview"
            name="overview"
            value={formData.overview}
            onChange={handleInputChange}
            placeholder="Movie description"
            rows="5"
          />
        </div>

        <div className="form-group">
          <label htmlFor="release_date">Release Date</label>
          <input
            type="date"
            id="release_date"
            name="release_date"
            value={formData.release_date}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="language">Language</label>
          <input
            type="text"
            id="language"
            name="language"
            value={formData.language}
            onChange={handleInputChange}
            placeholder="e.g., en, fr, rw"
          />
        </div>
      </div>

      {/* Media URLs */}
      <div className="form-section">
        <h3>Media URLs</h3>

        <div className="form-group">
          <label htmlFor="videoUrl">Video URL *</label>
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/video.mp4"
          />
          <small>Full URL to your video file (MP4, WebM, OGV)</small>
        </div>

        <div className="form-group">
          <label htmlFor="poster">Poster Image URL</label>
          <input
            type="url"
            id="poster"
            name="poster"
            value={formData.poster}
            onChange={handleInputChange}
            placeholder="https://example.com/poster.jpg"
          />
          <small>Full URL to poster image (JPG, PNG)</small>
        </div>

        <div className="form-group">
          <label htmlFor="backdrop">Backdrop Image URL</label>
          <input
            type="url"
            id="backdrop"
            name="backdrop"
            value={formData.backdrop}
            onChange={handleInputChange}
            placeholder="https://example.com/backdrop.jpg"
          />
          <small>Full URL to backdrop image</small>
        </div>

        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail URL</label>
          <input
            type="url"
            id="thumbnail"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleInputChange}
            placeholder="https://example.com/thumbnail.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="streamingUrl">Streaming URL (HLS/Direct)</label>
          <input
            type="url"
            id="streamingUrl"
            name="streamingUrl"
            value={formData.streamingUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/stream.m3u8 or direct URL"
          />
          <small>Optional: Primary streaming URL for playback</small>
        </div>

        <div className="form-group">
          <label htmlFor="hlsUrl">HLS URL</label>
          <input
            type="url"
            id="hlsUrl"
            name="hlsUrl"
            value={formData.hlsUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/stream.m3u8"
          />
          <small>Optional: HLS streaming URL</small>
        </div>
      </div>

      {/* Video Settings */}
      <div className="form-section">
        <h3>Video Settings</h3>

        <div className="form-group">
          <label htmlFor="videoQuality">Video Quality</label>
          <select
            id="videoQuality"
            name="videoQuality"
            value={formData.videoQuality}
            onChange={handleInputChange}
          >
            <option value="240p">240p</option>
            <option value="360p">360p</option>
            <option value="480p">480p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
            <option value="4K">4K</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="videoDuration">Duration (seconds)</label>
          <input
            type="number"
            id="videoDuration"
            name="videoDuration"
            value={formData.videoDuration}
            onChange={handleInputChange}
            placeholder="e.g., 5400 for 90 minutes"
            min="1"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="form-section">
        <h3>Categories</h3>
        <div className="checkbox-group">
          {categories.map((category) => (
            <label key={category}>
              <input
                type="checkbox"
                checked={formData.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      {/* Tags & Keywords */}
      <div className="form-section">
        <h3>Tags & Keywords</h3>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            placeholder="tag1, tag2, tag3"
            value={formData.tags.join(', ')}
            onChange={(e) => handleArrayChange('tags', e.target.value)}
          />
          <small>Enter tags separated by commas</small>
        </div>

        <div className="form-group">
          <label htmlFor="keywords">Keywords (comma-separated)</label>
          <input
            type="text"
            id="keywords"
            placeholder="keyword1, keyword2, keyword3"
            value={formData.keywords.join(', ')}
            onChange={(e) => handleArrayChange('keywords', e.target.value)}
          />
          <small>Enter keywords separated by commas</small>
        </div>
      </div>

      {/* Pricing */}
      <div className="form-section">
        <h3>Pricing & Monetization</h3>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            placeholder="0 for free"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GHS">GHS</option>
            <option value="XOF">XOF</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="royaltyPercentage">Royalty Percentage (%)</label>
          <input
            type="number"
            id="royaltyPercentage"
            name="royaltyPercentage"
            value={formData.royaltyPercentage}
            onChange={handleInputChange}
            min="0"
            max="100"
          />
          <small>You receive this percentage of revenue</small>
        </div>
      </div>

      {/* Download Settings */}
      <div className="form-section">
        <h3>Download Settings</h3>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="allowDownload"
              checked={formData.allowDownload}
              onChange={handleInputChange}
            />
            Allow Downloads
          </label>
        </div>

        {formData.allowDownload && (
          <div className="form-group">
            <label htmlFor="downloadExpiry">Download Expiry (days)</label>
            <input
              type="number"
              id="downloadExpiry"
              name="downloadExpiry"
              value={formData.downloadExpiry}
              onChange={handleInputChange}
              min="1"
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="form-section">
        {errors.submit && <div className="error-message">{errors.submit}</div>}
        <button type="submit" className="submit-btn">
          Upload Movie
        </button>
      </div>
    </form>
  );
};

export default MovieUploadForm;
```

---

## Backend API Call Update

### Update the frontend service to send JSON instead of FormData

**File:** `src/services/api/movies.js`

```javascript
export const moviesService = {
  // ... other methods ...

  // UPDATED: Send as JSON, not FormData
  uploadMovie: (movieData) =>
    moviesAPI.post('/upload', movieData, {
      headers: { 'Content-Type': 'application/json' },
    }),
};
```

---

## Backend Controller Usage

Use the corrected controller from `CORRECTED_MOVIE_CONTROLLER.js`:

```javascript
import moviesController from '../controllers/moviesController.js';

// In your routes/movies.js
router.post('/upload', authMiddleware, moviesController.addMovie);
router.get('/', moviesController.getAllMovies);
router.get('/:id', moviesController.getMovieById);
router.put('/:id', authMiddleware, moviesController.updateMovie);
router.delete('/:id', authMiddleware, moviesController.deleteMovie);
router.get('/search', moviesController.searchMovies);
router.get('/filmmaker/my-movies', authMiddleware, moviesController.getFilmmakerMovies);
```

---

## Complete Request Example

### Frontend: Sending Movie Data

```javascript
const movieData = {
  title: "KILLAMAN",
  original_title: "MY HEART SERIES:EP-250",
  overview: "my heart ni movie ishingiye kunkuru y'urukundo",
  release_date: "2025-11-05",

  // URLs, not files
  videoUrl: "https://cloudinary.com/videos/killaman.mp4",
  poster: "https://cloudinary.com/posters/killaman.jpg",
  backdrop: "https://cloudinary.com/backdrops/killaman.jpg",
  thumbnail: "https://cloudinary.com/thumbnails/killaman.jpg",

  // Arrays (not strings)
  categories: ["Comedy", "Drama"],
  tags: ["movie", "series"],
  keywords: ["love story", "action"],

  // Other fields
  price: 300,
  currency: "USD",
  royaltyPercentage: 70,
  videoQuality: "720p",
  videoDuration: 17,
  language: "en",
  allowDownload: true,
  downloadExpiry: 30,
};

// Send as JSON
await moviesService.uploadMovie(movieData);
```

---

## Key Changes Summary

| Issue | Before | After |
|-------|--------|-------|
| Arrays | Sent as strings: `"tag1,tag2"` | Sent as arrays: `["tag1", "tag2"]` |
| Files | Tried to send files | Send URLs only |
| Title | Missing in validation | Required and validated |
| Content-Type | multipart/form-data | application/json |
| Helper Function | None | `parseFormData()` to convert strings to arrays |

---

## Testing with cURL

```bash
curl -X POST http://localhost:5000/api/movies/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "KILLAMAN",
    "original_title": "MY HEART SERIES:EP-250",
    "overview": "my heart ni movie ishingiye kunkuru y'"'"'urukundo",
    "release_date": "2025-11-05",
    "videoUrl": "https://cloudinary.com/videos/killaman.mp4",
    "poster": "https://cloudinary.com/posters/killaman.jpg",
    "backdrop": "https://cloudinary.com/backdrops/killaman.jpg",
    "categories": ["Comedy", "Drama"],
    "tags": ["movie"],
    "keywords": ["love story"],
    "price": 300,
    "currency": "USD",
    "royaltyPercentage": 70,
    "videoQuality": "720p",
    "videoDuration": 17,
    "language": "en",
    "allowDownload": true,
    "downloadExpiry": 30
  }'
```
