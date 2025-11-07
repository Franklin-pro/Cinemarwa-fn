# Film Nyarwanda - Backend API Specification

**Version:** 1.0
**Last Updated:** November 5, 2025
**Status:** Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Payments API](#payments-api)
5. [Movies API](#movies-api)
6. [Error Handling](#error-handling)
7. [Database Schema](#database-schema)
8. [Implementation Guide](#implementation-guide)

---

## Overview

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.filmnyarwanda.com/api
```

### Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "status": "success" | "error",
  "code": "HTTP_CODE",
  "data": { /* response data */ } | null,
  "message": "Human-readable message",
  "timestamp": "2024-11-05T15:30:00Z"
}
```

### Common HTTP Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

---

## Authentication

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "filmmaker" | "viewer" | "admin"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_123",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "filmmaker",
      "createdAt": "2024-11-05T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400` - Email already exists
- `400` - Invalid password format
- `400` - Invalid role

---

### POST /auth/login
Authenticate user and return JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user_123",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "filmmaker"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `400` - Missing email or password

---

### GET /auth/me
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "user_123",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "filmmaker",
    "createdAt": "2024-11-05T10:30:00Z",
    "updatedAt": "2024-11-05T15:45:00Z"
  }
}
```

**Errors:**
- `401` - Invalid or expired token

---

## Payments API

### POST /payments/momo
Initiate Mobile Money (MTN MoMo) payment.

**Request:**
```json
{
  "movieId": "movie_456",
  "type": "watch" | "download",
  "phoneNumber": "+250788123456",
  "amount": 2.99,
  "currency": "RWF" | "USD"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "transactionId": "txn_momo_789",
    "status": "pending",
    "movieId": "movie_456",
    "type": "watch",
    "amount": 2.99,
    "currency": "RWF",
    "phoneNumber": "+250788123456",
    "expiresAt": "2024-11-05T16:30:00Z",
    "confirmationCode": "123456",
    "createdAt": "2024-11-05T15:30:00Z"
  }
}
```

**Flow:**
1. Validate movie exists and is available
2. Check user hasn't already purchased for "watch"
3. Create transaction record (status: pending)
4. Initiate MTN MoMo API call
5. Return transactionId for confirmation

**Errors:**
- `400` - Invalid phone number
- `400` - Invalid amount
- `404` - Movie not found
- `409` - User already has access to this movie

---

### POST /payments/stripe
Initiate Stripe card payment.

**Request:**
```json
{
  "movieId": "movie_456",
  "type": "watch" | "download",
  "amount": 2.99,
  "currency": "usd",
  "stripeToken": "tok_visa"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "transactionId": "txn_stripe_321",
    "status": "processing",
    "movieId": "movie_456",
    "type": "watch",
    "amount": 2.99,
    "currency": "usd",
    "stripePaymentIntentId": "pi_1234567890",
    "status": "requires_confirmation",
    "clientSecret": "pi_1234567890_secret_xyz",
    "createdAt": "2024-11-05T15:30:00Z"
  }
}
```

**Flow:**
1. Validate movie exists and is available
2. Check user hasn't already purchased for "watch"
3. Create transaction record (status: processing)
4. Call Stripe API to create payment intent
5. Return clientSecret for client-side confirmation

**Errors:**
- `400` - Invalid amount
- `400` - Invalid currency
- `404` - Movie not found
- `409` - User already has access

---

### POST /payments/:paymentId/confirm
Confirm payment after MTN MoMo or Stripe authorization.

**Request:**
```json
{
  "confirmationCode": "123456",
  "paymentMethod": "momo" | "stripe"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "transactionId": "txn_momo_789",
    "status": "completed",
    "movieId": "movie_456",
    "userId": "user_123",
    "type": "watch",
    "amount": 2.99,
    "paymentMethod": "momo",
    "completedAt": "2024-11-05T15:35:00Z"
  }
}
```

**Backend Logic:**
1. Find transaction by ID
2. Verify confirmation code (for MoMo) or verify Stripe payment
3. Update transaction status to "completed"
4. Grant user access to movie:
   - For "watch": Add to user's viewed movies
   - For "download": Add to user's downloaded movies
5. Update movie's transaction count
6. Calculate filmmaker revenue (movie price * percentage)
7. Update user's account balance or payment record

**Errors:**
- `400` - Invalid confirmation code
- `404` - Transaction not found
- `409` - Transaction already confirmed

---

### GET /payments/:paymentId
Get payment details.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "transactionId": "txn_momo_789",
    "userId": "user_123",
    "movieId": "movie_456",
    "type": "watch",
    "amount": 2.99,
    "currency": "RWF",
    "status": "completed",
    "paymentMethod": "momo",
    "createdAt": "2024-11-05T15:30:00Z",
    "completedAt": "2024-11-05T15:35:00Z"
  }
}
```

**Authorization:**
- User can view their own payments
- Admin can view any payment

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized to view this payment
- `404` - Payment not found

---

### GET /payments/user/:userId
Get all payments for a specific user.

**Query Parameters:**
```
?page=1
&limit=20
&status=completed|pending|failed
&paymentMethod=momo|stripe
&startDate=2024-01-01
&endDate=2024-12-31
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "payments": [
      {
        "transactionId": "txn_momo_789",
        "movieId": "movie_456",
        "type": "watch",
        "amount": 2.99,
        "status": "completed",
        "paymentMethod": "momo",
        "completedAt": "2024-11-05T15:35:00Z"
      },
      {
        "transactionId": "txn_stripe_321",
        "movieId": "movie_123",
        "type": "download",
        "amount": 4.99,
        "status": "completed",
        "paymentMethod": "stripe",
        "completedAt": "2024-11-04T10:20:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 95,
      "limit": 20
    },
    "summary": {
      "totalSpent": 150.50,
      "totalTransactions": 95,
      "completedCount": 93,
      "pendingCount": 2,
      "failedCount": 0
    }
  }
}
```

**Authorization:**
- User can view their own payments
- Admin can view any user's payments

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized
- `404` - User not found

---

### GET /payments/movie/:movieId/analytics
Get analytics for movie payments and revenue.

**Query Parameters:**
```
?period=day|week|month|year
&startDate=2024-01-01
&endDate=2024-12-31
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "movieId": "movie_456",
    "movieTitle": "My Great Film",
    "filmmakerName": "John Doe",

    "revenue": {
      "totalRevenue": 2456.50,
      "watchRevenue": 1500.00,
      "downloadRevenue": 956.50,
      "platformFee": 245.65,
      "filmmakerEarnings": 2210.85
    },

    "transactions": {
      "totalTransactions": 456,
      "completedTransactions": 450,
      "pendingTransactions": 4,
      "failedTransactions": 2
    },

    "users": {
      "totalViews": 1250,
      "totalDownloads": 156,
      "uniqueViewers": 450,
      "uniqueDownloaders": 125
    },

    "paymentMethods": {
      "momoTransactions": 350,
      "momoRevenue": 1750.00,
      "stripeTransactions": 100,
      "stripeRevenue": 706.50
    },

    "trends": {
      "dailyRevenue": [
        { "date": "2024-11-05", "revenue": 125.50, "transactions": 20 },
        { "date": "2024-11-04", "revenue": 98.30, "transactions": 15 },
        { "date": "2024-11-03", "revenue": 156.75, "transactions": 25 }
      ],
      "regionAnalytics": [
        { "region": "Rwanda", "revenue": 1500.00, "percentage": 61 },
        { "region": "Uganda", "revenue": 650.50, "percentage": 27 },
        { "region": "Kenya", "revenue": 306.00, "percentage": 12 }
      ]
    }
  }
}
```

**Authorization:**
- Filmmaker can view their own movie analytics
- Admin can view any analytics

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized to view this movie
- `404` - Movie not found

---

## Movies API

### POST /movies/upload
Upload a new movie.

**Request (multipart/form-data):**
```
{
  "title": "My Great Film",
  "description": "An amazing story...",
  "genre": "drama",
  "watchPrice": 2.99,
  "downloadPrice": 4.99,
  "director": "John Smith",
  "cast": "Actor 1, Actor 2",
  "runtime": 125,
  "releaseYear": 2024,
  "language": "en",
  "subtitle": "rw,fr",
  "isVisible": true,
  "videoFile": <file>,
  "thumbnailFile": <file>,
  "backdropFile": <file>
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "movie_456",
    "userId": "user_123",
    "title": "My Great Film",
    "description": "An amazing story...",
    "genre": "drama",
    "watchPrice": 2.99,
    "downloadPrice": 4.99,
    "status": "pending",
    "uploadedAt": "2024-11-05T15:30:00Z",
    "videoUrl": "https://storage.example.com/videos/movie_456.mp4",
    "thumbnailUrl": "https://storage.example.com/thumbnails/movie_456.jpg",
    "backdropUrl": "https://storage.example.com/backdrops/movie_456.jpg"
  }
}
```

**Backend Logic:**
1. Authenticate user (filmmaker or admin only)
2. Validate all required fields
3. Validate file sizes (video max 10GB, images max 50MB)
4. Validate file types (mp4, webm, ogv for video; jpg, png for images)
5. Upload files to cloud storage (AWS S3, Google Cloud, etc.)
6. Create movie record in database with status "pending"
7. Store URLs from cloud storage
8. Return movie object with URLs

**Errors:**
- `401` - Not authenticated
- `400` - Invalid input or missing fields
- `400` - File too large
- `400` - Invalid file type
- `413` - Payload too large

---

### GET /movies/:id
Get movie details.

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "movie_456",
    "title": "My Great Film",
    "description": "An amazing story...",
    "genre": "drama",
    "watchPrice": 2.99,
    "downloadPrice": 4.99,
    "director": "John Smith",
    "cast": "Actor 1, Actor 2",
    "runtime": 125,
    "releaseYear": 2024,
    "language": "en",
    "subtitles": ["rw", "fr"],
    "status": "published",
    "rating": 4.2,
    "reviewCount": 45,
    "views": 1250,
    "downloads": 156,
    "filmmaker": {
      "id": "user_123",
      "name": "John Doe",
      "bio": "Independent filmmaker...",
      "avatar": "https://storage.example.com/avatars/user_123.jpg"
    },
    "videoUrl": "https://storage.example.com/videos/movie_456.mp4",
    "thumbnailUrl": "https://storage.example.com/thumbnails/movie_456.jpg",
    "backdropUrl": "https://storage.example.com/backdrops/movie_456.jpg",
    "createdAt": "2024-11-05T10:30:00Z",
    "updatedAt": "2024-11-05T15:45:00Z"
  }
}
```

**Errors:**
- `404` - Movie not found

---

### PUT /movies/:id
Update movie details.

**Request:**
```json
{
  "title": "Updated Title",
  "description": "Updated description...",
  "genre": "drama",
  "watchPrice": 3.99,
  "downloadPrice": 5.99,
  "isVisible": true
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "movie_456",
    "title": "Updated Title",
    "description": "Updated description...",
    "genre": "drama",
    "watchPrice": 3.99,
    "downloadPrice": 5.99,
    "isVisible": true,
    "updatedAt": "2024-11-05T16:00:00Z"
  }
}
```

**Authorization:**
- Filmmaker can update their own movies
- Admin can update any movie

**Field Restrictions:**
- ✅ Can update: title, description, genre, watchPrice, downloadPrice, isVisible
- ❌ Cannot update: status, views, downloads, uploadedAt, filmmaker

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized
- `400` - Invalid input
- `404` - Movie not found

---

### DELETE /movies/:id
Delete a movie.

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Movie deleted successfully",
  "data": {
    "id": "movie_456",
    "title": "My Great Film"
  }
}
```

**Authorization:**
- Filmmaker can delete their own movies
- Admin can delete any movie

**Backend Logic:**
1. Find movie by ID
2. Verify ownership or admin status
3. Delete video and image files from cloud storage
4. Delete movie record from database
5. Delete associated reviews and ratings
6. Return success response

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized
- `404` - Movie not found

---

### GET /movies/search
Search for movies.

**Query Parameters:**
```
?q=search+term          (required)
&genre=drama
&minPrice=1.00
&maxPrice=10.00
&sortBy=relevance|views|rating|date
&page=1
&limit=20
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "movies": [
      {
        "id": "movie_456",
        "title": "My Great Film",
        "genre": "drama",
        "watchPrice": 2.99,
        "rating": 4.2,
        "views": 1250,
        "thumbnailUrl": "https://storage.example.com/thumbnails/movie_456.jpg"
      },
      {
        "id": "movie_789",
        "title": "Another Great Film",
        "genre": "drama",
        "watchPrice": 3.99,
        "rating": 4.5,
        "views": 2100,
        "thumbnailUrl": "https://storage.example.com/thumbnails/movie_789.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 95,
      "limit": 20
    },
    "query": "search term",
    "resultsCount": 95
  }
}
```

**Errors:**
- `400` - Missing search query

---

### GET /movies/trending
Get trending movies.

**Query Parameters:**
```
?period=day|week|month
&limit=20
&genre=drama
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "period": "week",
    "movies": [
      {
        "id": "movie_456",
        "title": "My Great Film",
        "genre": "drama",
        "watchPrice": 2.99,
        "rating": 4.2,
        "views": 5250,
        "trending": true,
        "trendingScore": 95,
        "thumbnailUrl": "https://storage.example.com/thumbnails/movie_456.jpg"
      }
    ],
    "generatedAt": "2024-11-05T15:30:00Z"
  }
}
```

**Backend Logic:**
- Calculate trending score based on recent views and engagement
- Filter by period (24h, 7d, 30d)
- Rank by views, shares, ratings
- Cache results for performance

---

### GET /movies/top-rated
Get top-rated movies.

**Query Parameters:**
```
?limit=20
&minRating=4.0
&genre=drama
&page=1
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "movies": [
      {
        "id": "movie_456",
        "title": "My Great Film",
        "genre": "drama",
        "watchPrice": 2.99,
        "rating": 4.8,
        "reviewCount": 456,
        "views": 5250,
        "thumbnailUrl": "https://storage.example.com/thumbnails/movie_456.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalRecords": 52,
      "limit": 20
    }
  }
}
```

---

### GET /movies/category/:category
Get movies by category/genre.

**Categories:** action, drama, comedy, thriller, horror, romance, documentary, animation, sci-fi, mystery

**Query Parameters:**
```
?page=1
&limit=20
&sortBy=latest|trending|topRated
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "category": "drama",
    "movies": [
      {
        "id": "movie_456",
        "title": "My Great Film",
        "genre": "drama",
        "watchPrice": 2.99,
        "rating": 4.2,
        "views": 1250,
        "thumbnailUrl": "https://storage.example.com/thumbnails/movie_456.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalRecords": 195,
      "limit": 20
    }
  }
}
```

**Errors:**
- `400` - Invalid category

---

### GET /movies/filmmaker/:filmmakerIdId
Get all movies from a specific filmmaker.

**Query Parameters:**
```
?page=1
&limit=20
&sortBy=latest|trending|topRated
&status=published|all
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "filmmaker": {
      "id": "user_123",
      "name": "John Doe",
      "bio": "Independent filmmaker from Rwanda",
      "avatar": "https://storage.example.com/avatars/user_123.jpg",
      "totalMovies": 5,
      "totalViews": 12450,
      "totalReviews": 1250,
      "averageRating": 4.3
    },
    "movies": [
      {
        "id": "movie_456",
        "title": "My Great Film",
        "genre": "drama",
        "watchPrice": 2.99,
        "rating": 4.2,
        "views": 1250,
        "thumbnailUrl": "https://storage.example.com/thumbnails/movie_456.jpg"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRecords": 5,
      "limit": 20
    }
  }
}
```

**Errors:**
- `404` - Filmmaker not found

---

### POST /movies/:id/reviews
Add a review to a movie.

**Request:**
```json
{
  "rating": 5,
  "title": "Amazing film!",
  "content": "This film was absolutely incredible. Highly recommend!",
  "spoilerWarning": false
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "id": "review_123",
    "movieId": "movie_456",
    "userId": "user_123",
    "userName": "John Viewer",
    "rating": 5,
    "title": "Amazing film!",
    "content": "This film was absolutely incredible...",
    "spoilerWarning": false,
    "helpful": 0,
    "createdAt": "2024-11-05T15:30:00Z"
  }
}
```

**Authorization:**
- User must be authenticated
- User must have viewed the movie (purchased)

**Errors:**
- `401` - Not authenticated
- `403` - User hasn't purchased/viewed movie
- `400` - Invalid input

---

### GET /movies/:id/reviews
Get reviews for a movie.

**Query Parameters:**
```
?page=1
&limit=20
&sortBy=helpful|recent|highestRated|lowestRated
&ratingFilter=5|4|3|2|1
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "movieId": "movie_456",
    "reviews": [
      {
        "id": "review_123",
        "userId": "user_123",
        "userName": "John Viewer",
        "rating": 5,
        "title": "Amazing film!",
        "content": "This film was absolutely incredible...",
        "helpful": 42,
        "createdAt": "2024-11-05T15:30:00Z"
      }
    ],
    "summary": {
      "averageRating": 4.2,
      "totalReviews": 456,
      "ratingDistribution": {
        "5": 200,
        "4": 150,
        "3": 80,
        "2": 20,
        "1": 6
      }
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 23,
      "totalRecords": 456,
      "limit": 20
    }
  }
}
```

---

### POST /movies/:id/rating
Rate a movie.

**Request:**
```json
{
  "rating": 5
}
```

**Response (201 Created or 200 OK):**
```json
{
  "status": "success",
  "data": {
    "movieId": "movie_456",
    "userId": "user_123",
    "rating": 5,
    "createdAt": "2024-11-05T15:30:00Z"
  }
}
```

**Errors:**
- `401` - Not authenticated
- `400` - Invalid rating (1-5)
- `404` - Movie not found

---

## Error Handling

### Error Response Format

```json
{
  "status": "error",
  "code": 400,
  "message": "Invalid input provided",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2024-11-05T15:30:00Z"
}
```

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| `400` | Bad Request | Invalid input or malformed request |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Authenticated but not authorized |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Resource already exists or conflict |
| `413` | Payload Too Large | File or request too large |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('viewer', 'filmmaker', 'admin') DEFAULT 'viewer',
  bio TEXT,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(email),
  INDEX(role)
);
```

### Movies Table
```sql
CREATE TABLE movies (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  genre VARCHAR(50),
  status ENUM('draft', 'pending', 'published', 'rejected') DEFAULT 'draft',
  watch_price DECIMAL(10, 2),
  download_price DECIMAL(10, 2),
  director VARCHAR(255),
  cast TEXT,
  runtime INT,
  release_year INT,
  language VARCHAR(10),
  subtitles JSON,
  views INT DEFAULT 0,
  downloads INT DEFAULT 0,
  video_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  backdrop_url VARCHAR(500),
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX(user_id),
  INDEX(status),
  INDEX(genre),
  INDEX(created_at)
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  movie_id VARCHAR(36) NOT NULL,
  type ENUM('watch', 'download') NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10),
  status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_method ENUM('momo', 'stripe') NOT NULL,
  payment_gateway_id VARCHAR(255),
  confirmation_code VARCHAR(50),
  expires_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (movie_id) REFERENCES movies(id),
  INDEX(user_id),
  INDEX(movie_id),
  INDEX(status),
  INDEX(created_at)
);
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id VARCHAR(36) PRIMARY KEY,
  movie_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  spoiler_warning BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX(movie_id),
  INDEX(user_id),
  INDEX(rating),
  UNIQUE(movie_id, user_id)
);
```

### Ratings Table
```sql
CREATE TABLE ratings (
  id VARCHAR(36) PRIMARY KEY,
  movie_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX(movie_id),
  INDEX(user_id),
  UNIQUE(movie_id, user_id)
);
```

### User Purchases Table
```sql
CREATE TABLE user_purchases (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  movie_id VARCHAR(36) NOT NULL,
  type ENUM('watch', 'download') NOT NULL,
  transaction_id VARCHAR(36),
  amount_paid DECIMAL(10, 2),
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (movie_id) REFERENCES movies(id),
  INDEX(user_id),
  INDEX(movie_id),
  INDEX(type),
  UNIQUE(user_id, movie_id, type)
);
```

---

## Implementation Guide

### Technology Stack (Recommended)

**Node.js Backend:**
- Express.js - Web framework
- PostgreSQL/MySQL - Database
- JWT - Authentication
- Stripe SDK - Stripe integration
- Firebase Storage / AWS S3 - File storage
- Redis - Caching
- Winston/Morgan - Logging

### Folder Structure

```
backend/
├── config/
│   ├── database.js
│   ├── jwt.js
│   ├── stripe.js
│   └── momo.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── validation.js
│   └── rateLimiter.js
├── controllers/
│   ├── authController.js
│   ├── paymentsController.js
│   ├── moviesController.js
│   └── reviewsController.js
├── models/
│   ├── User.js
│   ├── Movie.js
│   ├── Transaction.js
│   ├── Review.js
│   └── Rating.js
├── routes/
│   ├── auth.js
│   ├── payments.js
│   ├── movies.js
│   └── reviews.js
├── services/
│   ├── authService.js
│   ├── stripeService.js
│   ├── momoService.js
│   └── storageService.js
├── utils/
│   ├── jwt.js
│   ├── encryption.js
│   └── validators.js
├── app.js
└── server.js
```

### Key Implementation Points

1. **Authentication**
   - Use bcrypt for password hashing
   - Issue JWT tokens with 24hr expiry
   - Implement refresh token rotation
   - Validate JWT on all protected routes

2. **Authorization**
   - Always check `user_id` from token matches resource owner
   - Implement role-based access control (RBAC)
   - Verify ownership before updates/deletions

3. **Payment Processing**
   - Store all transaction details securely
   - Never expose payment secrets
   - Implement idempotency for payment operations
   - Log all payment events for auditing

4. **File Upload**
   - Validate file types and sizes
   - Scan for malware before storing
   - Use cloud storage (S3, Google Cloud)
   - Generate secure URLs with expiry

5. **Performance**
   - Cache frequently accessed data (Redis)
   - Paginate large result sets
   - Index database queries properly
   - Compress responses (gzip)

6. **Security**
   - Use HTTPS only
   - Implement CORS properly
   - Rate limit API endpoints
   - Validate all inputs
   - Sanitize database queries
   - Add request logging
   - Implement request/response encryption

---

**Status:** Ready for backend development 🚀
