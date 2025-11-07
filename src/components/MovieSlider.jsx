import {
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { useMovies } from "../context/MovieContext";
import { useSelector } from "react-redux";

function MovieSlider({ title, subtitle = "", movies }) {
  const sliderRef = useRef(null);
  const {openMovieDetails} = useMovies();
  const [hoveblueMovieId,setHoveblueMovieId] = useState(null)
  const { user } = useSelector((state) => state.auth);
  const handleMovieClick = (movieId)=>{
    openMovieDetails(movieId);
    if(user ===null){
      alert("Please log in to view movie details.");
      return;

    }
  }

  const scroll = (direction) => {
    if (!sliderRef.current) return;

    const scrollAmount = sliderRef.current.clientWidth * 0.8; // scroll ~80% of visible width
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };
if(!movies || movies.length === 0){
  return null;
}
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-baseline mb-8">
          <div className="text-2xl font-bold text-white md:text-3xl">
            <h2>{title}</h2>
            {subtitle && (
              <p className="text-neutral-400 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => scroll("left")}
              className="bg-neutral-800/70 hover:bg-neutral-700 rounded-full p-1"
            >
              <ChevronLeft className="text-white" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="bg-neutral-800/70 hover:bg-neutral-700 rounded-full p-1"
            >
              <ChevronRight className="text-white" />
            </button>
          </div>
        </div>

        {/* Movie Slider */}
        <div className="relative">
          <div
            ref={sliderRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 snap-x scroll-smooth"
          >
            {movies && movies.length > 0 ? (
              movies.map((movie) => (
                <div
                  key={movie.id}
                  onMouseEnter={()=>setHoveblueMovieId(movie.id)}
                  onMouseLeave={()=>setHoveblueMovieId(null)}
                  onClick={() => handleMovieClick(movie.id || movie._id)}
                  className="min-w-[200px] md:min-w-[240px] snap-start relative group cursor-pointer flex-shrink-0"
                >
                  <div className="rounded-lg overflow-hidden bg-neutral-800">
                    <div className="relative aspect-[2/3]">
                      <img
                        src={
                          // If it's a full URL (backend), use directly
                          movie.poster_path?.startsWith('http')
                            ? movie.poster_path
                            // If it's TMDB path, add TMDB domain
                            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        }
                        alt={movie.title || movie.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://i.pinimg.com/736x/5e/fa/63/5efa63b54ff96796a20db50004fddd86.jpg";
                        }}
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 opacity-0 group-hover:opacity-100 transition-all duration-300 via-neutral-900/40 to-transparent flex justify-end flex-col">
                        <div className="transform translate-y-4 pb-4 group-hover:translate-y-0 transition-transform duration-300 space-y-3 px-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-yellow-500 text-sm font-medium">
                                {movie.vote_average?.toFixed(1) || movie.avgRating?.toFixed(1) || "N/A"}
                              </span>
                            </div>
                            <span className="text-neutral-400 text-sm">
                              {movie.release_date
                                ? new Date(movie.release_date).getFullYear()
                                : "TBA"}
                            </span>
                          </div>
                          <button onClick={() => handleMovieClick(movie.id)} className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md items-center justify-center gap-1 transition-all text-sm">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="mt-3">
                    <h3 className="text-white text-sm font-medium truncate">
                      {movie.title || movie.name}
                    </h3>
                    <div className="flex items-center gap-4 justify-between mt-1">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-yellow-500 text-xs font-medium">
                          {movie.vote_average?.toFixed(1) || movie.avgRating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                      <span className="text-neutral-400 text-xs">
                        {movie.release_date
                          ? new Date(movie.release_date).getFullYear()
                          : "TBA"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-neutral-400 text-center w-full py-8">
                No movies available
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MovieSlider;
