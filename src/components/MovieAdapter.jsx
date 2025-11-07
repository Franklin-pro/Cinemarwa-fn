/**
 * Movie Adapter - Normalizes movie objects from different sources
 * Converts backend movie format to component-compatible format
 */

export const normalizeMovie = (movie) => {
  // If it's a TMDB movie (has id from TMDB and standard TMDB structure)
  if (movie.id && !movie._id) {
    return movie;
  }

  // Backend movie - use actual data
  return {
    // ID fields
    id: movie._id,
    _id: movie._id,

    // Title fields
    title: movie.title,
    name: movie.title,
    original_title: movie.original_title,

    // Image URLs - use direct URLs from backend
    poster_path: movie.poster_path || movie.poster,
    backdrop_path: movie.backdrop_path || movie.backdrop,

    // Description
    overview: movie.overview,

    // Dates
    release_date: movie.release_date,
    uploadedAt: movie.uploadedAt,

    // Ratings and views
    vote_average: movie.avgRating || 0,
    vote_count: movie.reviewCount || 0,
    popularity: movie.totalViews || 0,
    totalViews: movie.totalViews || 0,
    avgRating: movie.avgRating || 0,
    reviewCount: movie.reviewCount || 0,

    // Video details
    videoUrl: movie.videoUrl || movie.streamingUrl,
    videoDuration: movie.videoDuration,
    videoQuality: movie.videoQuality,

    // Metadata
    genres: movie.categories || movie.genre_ids || [],
    categories: movie.categories,
    keywords: movie.keywords,
    tags: movie.tags,
    language: movie.language,

    // Filmmaker info
    filmmaker: movie.filmmaker,

    // Pricing
    price: movie.price || movie.viewPrice,
    viewPrice: movie.viewPrice,
    downloadPrice: movie.downloadPrice,
    currency: movie.currency,
    royaltyPercentage: movie.royaltyPercentage,

    // Status and stats
    status: movie.status,
    processingStatus: movie.processingStatus,
    totalRevenue: movie.totalRevenue || 0,
    totalDownloads: movie.totalDownloads || 0,

    // Keep ALL original fields
    ...movie
  };
};

export const normalizeMovies = (movies) => {
  if (!Array.isArray(movies)) {
    return [];
  }
  return movies.map(normalizeMovie);
};
