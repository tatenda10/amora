import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../context/Api';
import {
  FaUsers,
  FaUserPlus,
  FaImages,
  FaClock,
  FaSpinner,
  FaArrowRight
} from 'react-icons/fa';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        {loading ? (
          <FaSpinner className="w-5 h-5 text-gray-400 animate-spin" />
        ) : (
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        )}
      </div>
      <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-full flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalCompanions: 0,
    newCompanions: 0,
    totalImages: 0,
    lastUpdated: null
  });
  const [recentCompanions, setRecentCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch companions for stats calculation
      const response = await axios.get(`${BASE_URL}/companions`, {
        params: { limit: 1000 } // Get all companions for stats
      });
      const companions = response.data.data || [];

      // Calculate stats
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

      const totalImages = companions.reduce((total, companion) => {
        let galleryCount = 0;
        try {
          if (Array.isArray(companion.gallery_images)) {
            galleryCount = companion.gallery_images.length;
          } else if (typeof companion.gallery_images === 'string') {
            galleryCount = JSON.parse(companion.gallery_images).length;
          }
        } catch (e) {
          console.warn('Error parsing gallery images for companion:', companion.id, e);
          galleryCount = 0;
        }
        return total + (companion.profile_image_url ? 1 : 0) + galleryCount;
      }, 0);

      const newCompanions = companions.filter(
        companion => new Date(companion.created_at) > thirtyDaysAgo
      ).length;

      setStats({
        totalCompanions: companions.length,
        newCompanions,
        totalImages,
        lastUpdated: new Date().toISOString()
      });

      // Get recent companions
      setRecentCompanions(
        companions
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5)
      );

      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-600">Overview of your companion management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Companions"
          value={stats.totalCompanions}
          icon={FaUsers}
          color="bg-blue-500"
          loading={loading}
        />
        <StatCard
          title="New Companions (30d)"
          value={stats.newCompanions}
          icon={FaUserPlus}
          color="bg-green-500"
          loading={loading}
        />
        <StatCard
          title="Total Images"
          value={stats.totalImages}
          icon={FaImages}
          color="bg-purple-500"
          loading={loading}
        />
        <StatCard
          title="Last Updated"
          value={stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : '-'}
          icon={FaClock}
          color="bg-orange-500"
          loading={loading}
        />
      </div>

      {/* Recent Companions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Recent Companions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 flex justify-center">
              <FaSpinner className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : recentCompanions.length > 0 ? (
            recentCompanions.map(companion => (
              <div key={companion.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {companion.profile_image_url ? (
                      <img
                        src={companion.profile_image_url}
                        alt={companion.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <FaUsers className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {companion.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(companion.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/companions/view/${companion.id}`}
                    className="text-gray-400 hover:text-gray-900"
                  >
                    <FaArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No companions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;