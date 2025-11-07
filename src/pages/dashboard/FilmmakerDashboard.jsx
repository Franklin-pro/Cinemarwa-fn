import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, TrendingUp, DollarSign, Upload, Eye, Download, Settings, BarChart3, Wallet, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { filmmmakerService } from '../../services/api/filmmaker';

function FilmmakerDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [movies, setMovies] = useState([]);
  const [stats, setStats] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);

  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch all dashboard data in parallel
      const [dashboardRes, moviesRes, statsRes, paymentRes] = await Promise.all([
        filmmmakerService.getDashboard(),
        filmmmakerService.getMovies(),
        filmmmakerService.getStats(),
        filmmmakerService.getPaymentMethod(),
      ]);

      const dashboardInfo = dashboardRes.data;
      const moviesList = moviesRes.data?.data || [];
      const statsInfo = statsRes.data;
      const paymentInfo = paymentRes.data;

      setDashboardData(dashboardInfo);
      setMovies(moviesList);
      setStats(statsInfo);
      setPaymentMethod(paymentInfo);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleManageMovie = (movieId) => {
    navigate(`/admin/movies/${movieId}/edit`);
  };

  const handleViewAnalytics = (movieId) => {
    navigate(`/admin/movies/${movieId}/analytics`);
  };

  // Helper function to safely convert to number and format with toFixed
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return num.toFixed(2);
  };

  const formatNumber = (value) => {
    const num = parseInt(value) || 0;
    return num.toLocaleString();
  };

  // Format duration in seconds to human readable format (e.g., 1h 30m, 45m, 30s)
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return 'N/A';

    const totalSeconds = parseInt(seconds) || 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    if (minutes > 0) {
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    }
    return `${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Format stats for display - use dashboard data as primary source
  const statCards = [
    { icon: Film, label: 'Total Movies', value: dashboardData?.summary?.totalMovies || stats?.totalMovies || '0' },
    { icon: Eye, label: 'Total Views', value: formatNumber(dashboardData?.summary?.totalViews || stats?.totalViews || 0) },
    { icon: DollarSign, label: 'Total Revenue', value: `$${formatCurrency(dashboardData?.summary?.filmmmakerEarnings || stats?.filmmmakerEarnings || 0)}` },
    { icon: Download, label: 'Total Downloads', value: formatNumber(dashboardData?.summary?.totalDownloads || stats?.totalDownloads || 0) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white px-4 py-8">
      <div className="max-w-7xl mx-auto pt-16">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Filmmaker Dashboard</h1>
            <p className="text-gray-400">Manage your films and track your earnings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard/filmmaker/upload')}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-all"
            >
              <Upload className="w-5 h-5" />
              Upload Movie
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-2 font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('movies')}
            className={`pb-3 px-2 font-semibold transition-colors ${
              activeTab === 'movies'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            My Movies
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`pb-3 px-2 font-semibold transition-colors ${
              activeTab === 'earnings'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Earnings
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat, i) => (
                <div
                  key={i}
                  className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-colors"
                >
                  <stat.icon className="w-8 h-8 text-yellow-400 mb-3" />
                  <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity / Dashboard Summary */}
            {dashboardData && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Revenue Summary */}
                <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    Revenue Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-gray-300">This Month</span>
                      <span className="text-xl font-bold text-yellow-400">${formatCurrency(dashboardData?.summary?.thisMonthRevenue || dashboardData?.finance?.thisMonthRevenue || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-gray-300">This Year</span>
                      <span className="text-xl font-bold text-yellow-400">${formatCurrency(dashboardData?.summary?.thisYearRevenue || dashboardData?.finance?.thisYearRevenue || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Earnings</span>
                      <span className="text-xl font-bold text-green-400">${formatCurrency(dashboardData?.summary?.totalRevenue || dashboardData?.finance?.totalEarned || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-yellow-400" />
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-gray-300">Avg Views per Movie</span>
                      <span className="font-bold">{formatNumber(dashboardData?.summary?.avgViewsPerMovie || stats?.averageViews || 0)}</span>
                    </div>
                    {/* <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-gray-300">Pending Payouts</span>
                      <span className="font-bold text-orange-400">${formatCurrency(dashboardData?.finance?.pendingBalance || 0)}</span>
                    </div> */}
                        <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-gray-300">Platform Fees</span>
                      <span className="font-bold text-orange-400">${formatCurrency(dashboardData?.summary.platformFee || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Account Status</span>
                      <span className={`font-bold ${dashboardData?.approval?.status === 'verified' || dashboardData?.approval?.status === 'approved' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {(dashboardData?.approval?.status || 'Pending')?.charAt(0).toUpperCase() + (dashboardData?.approval?.status || 'Pending')?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Wallet */}
            {dashboardData && (
               <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-400" />
              Account Settings
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/filmmaker/payment-method')}
               className="w-full text-left px-4 py-2.5 hover:bg-gray-700 rounded-lg transition-all flex items-center justify-between">
                <span>Payment Methods</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => navigate('/filmmaker/withdrawal-request')}
               className="w-full text-left px-4 py-2.5 hover:bg-gray-700 rounded-lg transition-all flex items-center justify-between">
                <span>Withdrawal History</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full text-left px-4 py-2.5 hover:bg-gray-700 rounded-lg transition-all flex items-center justify-between">
                <span>Account Profile</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-yellow-400" />
              Payment Method
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Manage your payment methods to ensure timely payouts
            </p>
            <div className="space-y-3">
              {paymentMethod?.currentMethod ? (
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-white capitalize">
                        {paymentMethod.currentMethod}
                      </span>
                    </div>
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>

                  {/* Display method-specific details */}
                  {paymentMethod.currentMethod === 'momo' && paymentMethod.paymentDetails?.momo && (
                    <div className="text-sm text-gray-300">
                      <p className="text-gray-400">Phone Number:</p>
                      <p className="font-mono">{paymentMethod.paymentDetails.momo}</p>
                    </div>
                  )}

                  {paymentMethod.currentMethod === 'bank' && paymentMethod.paymentDetails?.allMethods?.bankDetails && (
                    <div className="text-sm text-gray-300 space-y-2">
                      <p><span className="text-gray-400">Bank:</span> {paymentMethod.paymentDetails.allMethods.bankDetails.bankName}</p>
                      <p><span className="text-gray-400">Account:</span> ****{paymentMethod.paymentDetails.allMethods.bankDetails.accountNumber?.slice(-4)}</p>
                    </div>
                  )}

                  {paymentMethod.currentMethod === 'stripe' && paymentMethod.paymentDetails?.allMethods?.stripeAccountId && (
                    <div className="text-sm text-gray-300">
                      <p className="text-gray-400">Account ID:</p>
                      <p className="font-mono">{paymentMethod.paymentDetails.allMethods.stripeAccountId}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-200 font-semibold">No payment method configured</p>
                    <p className="text-yellow-100/70 text-sm">You need to add a payment method to receive payouts</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/filmmaker/payment-method')}
              className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-lg transition-all"
            >
              {paymentMethod?.currentMethod ? 'Update Payment Method' : 'Add Payment Method'}
            </button>
          </div>
        </div>
            )}
          </div>
        )}

        {/* MOVIES TAB */}
        {activeTab === 'movies' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">My Movies ({movies.length})</h2>
            {movies.length === 0 ? (
              <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-12 text-center">
                <Film className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">You haven't uploaded any movies yet</p>
                <button
                  onClick={() => navigate('/dashboard/filmmaker/upload')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold"
                >
                  Upload Your First Movie
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-4 gap-4">
                {movies.map((movie) => (
                  <div
                    key={movie._id}
                    className="bg-gray-800 rounded-lg overflow-hidden hover:border-yellow-500 border border-gray-700 transition-all group"
                  >
                    <div className="aspect-video bg-gray-700 flex items-center justify-center overflow-hidden relative">
                      {movie.poster ? (
                        <img
                          src={movie.backdrop}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <Film className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="font-semibold truncate flex items-center justify-between">
                        <span className="truncate">{movie.title}</span>
                        <span className="text-gray-400 text-xs ml-2 flex-shrink-0">{formatDate(movie.createdAt)}</span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>Duration: {formatDuration(movie.duration || movie.runtime)}</p>
                        <p>Views: {formatNumber(movie.totalViews || 0)}</p>
                        <p>Revenue: ${formatCurrency(movie.totalRevenue || 0)}</p>
                        <p className="capitalize text-yellow-400">Status: {movie.status}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleViewAnalytics(movie._id)}
                          className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded transition-all"
                        >
                          Analytics
                        </button>
                        <button
                          onClick={() => handleManageMovie(movie._id)}
                          className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded transition-all"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === 'earnings' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Earnings & Withdrawals</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
                <Wallet className="w-8 h-8 text-yellow-400 mb-3" />
                <p className="text-gray-400 text-sm mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-yellow-400">${formatCurrency(dashboardData?.finance?.availableBalance || stats?.availableBalance || 0)}</p>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
                <DollarSign className="w-8 h-8 text-green-400 mb-3" />
                <p className="text-gray-400 text-sm mb-1">Pending Payout</p>
                <p className="text-3xl font-bold text-green-400">${formatCurrency(dashboardData?.finance?.pendingBalance || stats?.pendingPayout || 0)}</p>
              </div>
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-6">
                <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
                <p className="text-gray-400 text-sm mb-1">Total Earned</p>
                <p className="text-3xl font-bold text-blue-400">${formatCurrency(dashboardData?.finance?.totalEarned || stats?.totalRevenue || 0)}</p>
              </div>
            </div>

            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Request Withdrawal</h3>
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-200">
                  ⚠️ Minimum withdrawal: $50 | Processing time: 5-7 business days
                </p>
              </div>
              <button
                onClick={() => navigate('/filmmaker/withdrawal-request')}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-semibold transition-all"
              >
                Request Withdrawal
              </button>
            </div>
          </div>
        )}
        {/* submitted movie */}
        {activeTab === 'submitted' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Submitted Movies</h2>
            <p className="text-gray-400">You have no submitted movies at this time.</p>
          </div>
          // <div className="grid md:grid-cols-3 gap-4">
          //   <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
          //     <h3 className="text-xl font-bold mb-4">Submitted Movies</h3>
          //     <p className="text-gray-400">You have no submitted movies at this time.</p>
          //   </div>
          // </div>
        )}
        {/* pending */}
        {activeTab === 'pending' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Pending movies</h2>
            <p className="text-gray-400">You have no pending at this time.</p>
          </div>
        )}
              {/* draft */}
        {activeTab === 'draft' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">draft movies</h2>
            <p className="text-gray-400">You have no draft at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilmmakerDashboard;