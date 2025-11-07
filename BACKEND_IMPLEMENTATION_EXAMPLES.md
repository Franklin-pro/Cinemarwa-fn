# Backend Implementation Examples

## Setup & Configuration

### 1. Express Server Setup

**server.js**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/movies', require('./routes/movies'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reviews', require('./routes/reviews'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    status: 'error',
    code: err.status || 500,
    message: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

### 2. JWT Authentication Middleware

**middleware/auth.js**
```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Missing authentication token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = {
      id: decoded.user_id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Token expired, please log in again'
      });
    }

    return res.status(401).json({
      status: 'error',
      code: 401,
      message: 'Invalid authentication token'
    });
  }
};

module.exports = authMiddleware;
```

---

## Authentication Implementation

### 3. Login Endpoint

**controllers/authController.js**
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Email and password required'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        code: 401,
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Response
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Login failed'
    });
  }
};

module.exports = { login };
```

---

## Payment Implementation

### 4. MTN MoMo Payment Initiation

**services/momoService.js**
```javascript
const axios = require('axios');
const crypto = require('crypto');

class MomoService {
  constructor() {
    this.apiKey = process.env.MOMO_API_KEY;
    this.apiUser = process.env.MOMO_API_USER;
    this.baseUrl = process.env.MOMO_API_URL;
  }

  // Generate request ID
  generateRequestId() {
    return crypto.randomUUID();
  }

  // Create authorization header
  createAuthHeader() {
    const auth = Buffer.from(`${this.apiUser}:${this.apiKey}`).toString('base64');
    return `Basic ${auth}`;
  }

  // Initiate payment request
  async initiatePayment(phoneNumber, amount, externalId) {
    try {
      const requestId = this.generateRequestId();

      const response = await axios.post(
        `${this.baseUrl}/v1_0/requesttopay`,
        {
          amount: amount.toString(),
          currency: 'EUR',
          externalId: externalId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: phoneNumber
          },
          payerMessage: 'Film Nyarwanda Purchase',
          payeeNote: 'Film Nyarwanda'
        },
        {
          headers: {
            'Authorization': this.createAuthHeader(),
            'X-Reference-Id': requestId,
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': this.apiKey
          }
        }
      );

      return {
        transactionId: requestId,
        status: 'pending',
        momoTransactionId: response.headers['x-reference-id']
      };
    } catch (error) {
      console.error('MoMo API Error:', error);
      throw new Error('Failed to initiate payment');
    }
  }

  // Check payment status
  async checkPaymentStatus(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1_0/requesttopay/${transactionId}`,
        {
          headers: {
            'Authorization': this.createAuthHeader(),
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': this.apiKey
          }
        }
      );

      return {
        status: response.data.status, // SUCCESSFUL, FAILED, PENDING
        amount: response.data.amount,
        currency: response.data.currency,
        payer: response.data.payer
      };
    } catch (error) {
      console.error('MoMo Status Check Error:', error);
      throw new Error('Failed to check payment status');
    }
  }
}

module.exports = new MomoService();
```

### 5. Create Payment Endpoint

**controllers/paymentsController.js**
```javascript
const Transaction = require('../models/Transaction');
const Movie = require('../models/Movie');
const momoService = require('../services/momoService');
const stripeService = require('../services/stripeService');

const createMoMoPayment = async (req, res) => {
  try {
    const { movieId, type, phoneNumber, amount, currency } = req.body;
    const userId = req.user.id;

    // Validation
    if (!movieId || !type || !phoneNumber || !amount) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Missing required fields',
        errors: [
          { field: 'movieId', message: 'Movie ID required' },
          { field: 'type', message: 'Type (watch|download) required' },
          { field: 'phoneNumber', message: 'Phone number required' },
          { field: 'amount', message: 'Amount required' }
        ]
      });
    }

    // Find movie
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Movie not found'
      });
    }

    // Check if user already has access
    const existingPurchase = await Transaction.findOne({
      user_id: userId,
      movie_id: movieId,
      type: type,
      status: 'completed'
    });

    if (existingPurchase) {
      return res.status(409).json({
        status: 'error',
        code: 409,
        message: 'User already has access to this movie'
      });
    }

    // Initiate payment
    const momoResult = await momoService.initiatePayment(
      phoneNumber,
      amount,
      `movie_${movieId}_${userId}`
    );

    // Create transaction record
    const transaction = await Transaction.create({
      user_id: userId,
      movie_id: movieId,
      type: type,
      amount: amount,
      currency: currency || 'RWF',
      status: 'pending',
      payment_method: 'momo',
      payment_gateway_id: momoResult.momoTransactionId,
      expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    // Response
    res.status(201).json({
      status: 'success',
      data: {
        transactionId: transaction.id,
        status: 'pending',
        movieId: movieId,
        type: type,
        amount: amount,
        currency: currency || 'RWF',
        phoneNumber: phoneNumber,
        expiresAt: transaction.expires_at,
        createdAt: transaction.created_at
      }
    });
  } catch (error) {
    console.error('Payment Error:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Failed to create payment'
    });
  }
};

module.exports = { createMoMoPayment };
```

### 6. Confirm Payment Endpoint

**controllers/paymentsController.js (continued)**
```javascript
const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { confirmationCode, paymentMethod } = req.body;
    const userId = req.user.id;

    // Find transaction
    const transaction = await Transaction.findById(paymentId);
    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Transaction not found'
      });
    }

    // Verify ownership
    if (transaction.user_id !== userId) {
      return res.status(403).json({
        status: 'error',
        code: 403,
        message: 'Not authorized to confirm this payment'
      });
    }

    // Check if already confirmed
    if (transaction.status === 'completed') {
      return res.status(409).json({
        status: 'error',
        code: 409,
        message: 'Payment already confirmed'
      });
    }

    let paymentValid = false;

    // Verify payment based on method
    if (paymentMethod === 'momo') {
      const momoStatus = await momoService.checkPaymentStatus(
        transaction.payment_gateway_id
      );
      paymentValid = momoStatus.status === 'SUCCESSFUL';
    } else if (paymentMethod === 'stripe') {
      const stripeStatus = await stripeService.confirmPayment(
        transaction.payment_gateway_id
      );
      paymentValid = stripeStatus.status === 'succeeded';
    }

    if (!paymentValid) {
      // Update transaction status
      await transaction.update({ status: 'failed' });

      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Payment verification failed'
      });
    }

    // Update transaction status
    await transaction.update({
      status: 'completed',
      completed_at: new Date()
    });

    // Grant access to movie
    await UserPurchase.create({
      user_id: userId,
      movie_id: transaction.movie_id,
      type: transaction.type,
      transaction_id: transaction.id,
      amount_paid: transaction.amount,
      purchased_at: new Date()
    });

    // Update movie views/downloads
    const updateField = transaction.type === 'watch' ? 'views' : 'downloads';
    await Movie.increment(updateField, {
      where: { id: transaction.movie_id }
    });

    // Calculate filmmaker earnings
    const movie = await Movie.findById(transaction.movie_id);
    const filmmakerEarnings = transaction.amount * 0.9; // 90% to filmmaker, 10% platform fee

    res.status(200).json({
      status: 'success',
      data: {
        transactionId: transaction.id,
        status: 'completed',
        movieId: transaction.movie_id,
        userId: userId,
        type: transaction.type,
        amount: transaction.amount,
        paymentMethod: transaction.payment_method,
        completedAt: transaction.completed_at
      }
    });
  } catch (error) {
    console.error('Confirmation Error:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Failed to confirm payment'
    });
  }
};

module.exports = { confirmPayment };
```

---

## Movies Implementation

### 7. Upload Movie Endpoint

**controllers/moviesController.js**
```javascript
const Movie = require('../models/Movie');
const storageService = require('../services/storageService');
const fs = require('fs').promises;

const uploadMovie = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      genre,
      watchPrice,
      downloadPrice,
      director,
      cast,
      runtime,
      releaseYear,
      language
    } = req.body;

    // Validation
    if (!title || !watchPrice || !downloadPrice) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Missing required fields',
        errors: [
          { field: 'title', message: 'Title required' },
          { field: 'watchPrice', message: 'Watch price required' },
          { field: 'downloadPrice', message: 'Download price required' }
        ]
      });
    }

    // Check files
    if (!req.files || !req.files.videoFile) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Video file required'
      });
    }

    const videoFile = req.files.videoFile;
    const thumbnailFile = req.files.thumbnailFile;

    // Validate file sizes
    if (videoFile.size > 10 * 1024 * 1024 * 1024) { // 10GB
      return res.status(413).json({
        status: 'error',
        code: 413,
        message: 'Video file too large (max 10GB)'
      });
    }

    if (thumbnailFile && thumbnailFile.size > 50 * 1024 * 1024) { // 50MB
      return res.status(413).json({
        status: 'error',
        code: 413,
        message: 'Thumbnail file too large (max 50MB)'
      });
    }

    // Upload files to cloud storage
    console.log('Uploading video to storage...');
    const videoUrl = await storageService.uploadVideo(videoFile, `movies/${userId}`);

    let thumbnailUrl = null;
    if (thumbnailFile) {
      console.log('Uploading thumbnail to storage...');
      thumbnailUrl = await storageService.uploadImage(thumbnailFile, `thumbnails/${userId}`);
    }

    // Create movie record
    const movie = await Movie.create({
      user_id: userId,
      title,
      description,
      genre,
      status: 'pending', // Requires admin approval
      watch_price: parseFloat(watchPrice),
      download_price: parseFloat(downloadPrice),
      director,
      cast,
      runtime: parseInt(runtime),
      release_year: parseInt(releaseYear),
      language,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      is_visible: false // Not visible until approved
    });

    // Response
    res.status(201).json({
      status: 'success',
      data: {
        id: movie.id,
        userId: movie.user_id,
        title: movie.title,
        genre: movie.genre,
        status: movie.status,
        watchPrice: movie.watch_price,
        downloadPrice: movie.download_price,
        videoUrl: movie.video_url,
        thumbnailUrl: movie.thumbnail_url,
        uploadedAt: movie.created_at
      }
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Failed to upload movie'
    });
  }
};

module.exports = { uploadMovie };
```

### 8. Get Movie Details

**controllers/moviesController.js (continued)**
```javascript
const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Find movie with filmmaker details
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Movie not found'
      });
    }

    // Get filmmaker info
    const filmmaker = await User.findById(movie.user_id, {
      attributes: ['id', 'first_name', 'last_name', 'bio', 'avatar_url']
    });

    // Get reviews and ratings
    const reviews = await Review.findAll({
      where: { movie_id: id }
    });

    const ratings = await Rating.findAll({
      where: { movie_id: id }
    });

    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 0;

    // Response
    res.status(200).json({
      status: 'success',
      data: {
        id: movie.id,
        title: movie.title,
        description: movie.description,
        genre: movie.genre,
        watchPrice: movie.watch_price,
        downloadPrice: movie.download_price,
        director: movie.director,
        cast: movie.cast,
        runtime: movie.runtime,
        releaseYear: movie.release_year,
        language: movie.language,
        status: movie.status,
        rating: parseFloat(avgRating),
        reviewCount: reviews.length,
        views: movie.views,
        downloads: movie.downloads,
        filmmaker: {
          id: filmmaker.id,
          name: `${filmmaker.first_name} ${filmmaker.last_name}`,
          bio: filmmaker.bio,
          avatar: filmmaker.avatar_url
        },
        videoUrl: movie.video_url,
        thumbnailUrl: movie.thumbnail_url,
        createdAt: movie.created_at,
        updatedAt: movie.updated_at
      }
    });
  } catch (error) {
    console.error('Get Movie Error:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Failed to get movie details'
    });
  }
};

module.exports = { getMovieDetails };
```

### 9. Search Movies

**controllers/moviesController.js (continued)**
```javascript
const searchMovies = async (req, res) => {
  try {
    const { q, genre, minPrice, maxPrice, sortBy = 'relevance', page = 1, limit = 20 } = req.query;

    // Validation
    if (!q) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Search query required'
      });
    }

    // Build query
    const where = {
      status: 'published',
      is_visible: true,
      [Op.or]: [
        { title: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
        { director: { [Op.like]: `%${q}%` } }
      ]
    };

    if (genre) {
      where.genre = genre;
    }

    if (minPrice) {
      where.watch_price = { [Op.gte]: parseFloat(minPrice) };
    }

    if (maxPrice) {
      where.watch_price = { [Op.lte]: parseFloat(maxPrice) };
    }

    // Determine sort order
    let order = [['created_at', 'DESC']];
    if (sortBy === 'views') {
      order = [['views', 'DESC']];
    } else if (sortBy === 'rating') {
      // Join with ratings table for sorting
      order = [[sequelize.literal('(SELECT AVG(rating) FROM ratings WHERE movie_id = Movie.id)'), 'DESC']];
    }

    // Fetch movies
    const offset = (page - 1) * limit;
    const { count, rows } = await Movie.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ['id', 'title', 'genre', 'watch_price', 'views', 'thumbnail_url', 'created_at']
    });

    // Response
    res.status(200).json({
      status: 'success',
      data: {
        movies: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalRecords: count,
          limit: parseInt(limit)
        },
        query: q,
        resultsCount: count
      }
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({
      status: 'error',
      code: 500,
      message: 'Failed to search movies'
    });
  }
};

module.exports = { searchMovies };
```

---

## Routes Setup

### 10. Routes Configuration

**routes/payments.js**
```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createMoMoPayment,
  createStripePayment,
  confirmPayment,
  getPaymentDetails,
  getUserPayments,
  getMovieAnalytics
} = require('../controllers/paymentsController');

// Protected routes
router.post('/momo', authMiddleware, createMoMoPayment);
router.post('/stripe', authMiddleware, createStripePayment);
router.post('/:paymentId/confirm', authMiddleware, confirmPayment);
router.get('/:paymentId', authMiddleware, getPaymentDetails);
router.get('/user/:userId', authMiddleware, getUserPayments);
router.get('/movie/:movieId/analytics', authMiddleware, getMovieAnalytics);

module.exports = router;
```

**routes/movies.js**
```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const {
  uploadMovie,
  getMovieDetails,
  searchMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getMoviesByCategory,
  getFilmmakerMovies,
  addReview,
  getReviews,
  rateMovie
} = require('../controllers/moviesController');

// Public routes
router.get('/:id', getMovieDetails);
router.get('/search', searchMovies);
router.get('/trending', getTrendingMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/category/:category', getMoviesByCategory);
router.get('/filmmaker/:filmmakerIdId', getFilmmakerMovies);
router.get('/:id/reviews', getReviews);

// Protected routes
router.post('/upload', authMiddleware, uploadMiddleware.single('videoFile'), uploadMovie);
router.post('/:id/reviews', authMiddleware, addReview);
router.post('/:id/rating', authMiddleware, rateMovie);

module.exports = router;
```

---

**Status:** Implementation Examples Complete ✅

Ready for backend team to implement with their preferred framework/technology stack.
