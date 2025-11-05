import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../context/Api';
import { FaSpinner, FaArrowLeft, FaEdit, FaTimes, FaMapMarkerAlt, FaUser, FaGlobe, FaIdCard } from 'react-icons/fa';

// Helper function to get full image URL
const getImageUrl = (path) => {
  if (!path) return null;
  // Remove /api from BASE_URL for static files
  const serverUrl = BASE_URL.replace('/api', '');
  return `${serverUrl}${path}`;
};

// Helper function to safely parse JSON
const safeJSONParse = (str, fallback = []) => {
  if (!str) return fallback;
  try {
    const parsed = typeof str === 'string' ? JSON.parse(str) : str;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
};

// Image Modal Component
const ImageModal = ({ imageUrl, alt, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-0">
      <div className="relative w-full h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <FaTimes className="w-6 h-6" />
        </button>
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

const ViewCompanionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchCompanion();
  }, [id]);

  const fetchCompanion = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/companions/${id}`);
      console.log('Fetched companion data:', response.data);
      setCompanion(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching companion:', err);
      setError('Failed to fetch companion details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="w-6 h-6 text-[#151529] animate-spin" />
      </div>
    );
  }

  if (error || !companion) {
    return (
      <div className="p-4 bg-red-50 border border-red-200/70 rounded-sm">
        <p className="text-red-600">{error || 'Companion not found'}</p>
      </div>
    );
  }

  // Parse gallery images once
  const galleryImages = safeJSONParse(companion.gallery_images);
  console.log('Parsed gallery images:', {
    raw: companion.gallery_images,
    parsed: galleryImages
  });

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-8">
      {/* Image Modal */}
      <ImageModal
        imageUrl={selectedImage}
        alt="Full size view"
        onClose={() => setSelectedImage(null)}
      />

      {/* Navigation Bar */}
      <div className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-base font-medium text-gray-700">Profile</h1>
        </div>
        <button
          onClick={() => navigate(`/companions/edit/${id}`)}
          className="flex items-center px-4 py-2 bg-[#151529] text-white hover:bg-gray-600 transition-colors text-xs"
        >
          <FaEdit className="w-3 h-3 mr-1.5" />
          Edit
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white shadow-sm mb-4">
        {/* Cover Image Placeholder */}
        <div className="h-48 bg-gradient-to-r from-[#151529] to-[#2d2d5b] relative"></div>
        
        {/* Profile Image and Name */}
        <div className="px-4 pb-4 relative">
          {companion.profile_image_url && (
            <img
              src={getImageUrl(companion.profile_image_url)}
              alt={companion.name}
              className="w-36 h-36 object-cover border-4 border-white absolute -top-20 left-4 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImage(getImageUrl(companion.profile_image_url))}
            />
          )}
          <div className="pt-24 pb-2">
            <h1 className="text-3xl font-bold text-gray-800">{companion.name}</h1>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <FaMapMarkerAlt className="w-4 h-4 mr-1" />
              <span>{companion.country}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-6xl mx-auto">
        {/* Gallery Section */}
        {galleryImages.length > 0 && (
          <div className="bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200/60">
              <h3 className="font-medium text-gray-800 text-lg">Gallery</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {galleryImages.map((image, index) => {
                  const imageUrl = getImageUrl(image);
                  console.log(`Gallery image ${index}:`, { original: image, url: imageUrl });
                  return (
                    <img
                      key={index}
                      src={imageUrl}
                      alt={`${companion.name} gallery ${index + 1}`}
                      className="w-full h-40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(imageUrl)}
                      onError={(e) => {
                        console.error(`Error loading image ${index}:`, image);
                        e.target.style.display = 'none';
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* About Section */}
        <div className="bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/60">
            <h3 className="font-medium text-gray-800 text-lg">About</h3>
          </div>
          <div className="p-6">
            <p className="text-base text-gray-700">{companion.personality}</p>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/60">
            <h3 className="font-medium text-gray-800 text-lg">Basic Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#151529]/10 mr-3">
                <FaUser className="w-3.5 h-3.5 text-[#151529]" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Age & Gender</span>
                <p className="text-sm">{companion.age}, {companion.gender}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#151529]/10 mr-3">
                <FaGlobe className="w-3.5 h-3.5 text-[#151529]" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Country</span>
                <p className="text-sm">{companion.country}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#151529]/10 mr-3">
                <FaIdCard className="w-3.5 h-3.5 text-[#151529]" />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Ethnicity</span>
                <p className="text-sm">{companion.ethnicity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Traits Section */}
        <div className="bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/60">
            <h3 className="font-medium text-gray-800 text-lg">Traits</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {safeJSONParse(companion.traits).map((trait, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-[#151529]/5 text-[#151529] text-xs font-medium"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div className="bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/60">
            <h3 className="font-medium text-gray-800 text-lg">Interests</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {safeJSONParse(companion.interests).map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-[#151529]/5 text-[#151529] text-xs font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Backstory Section */}
        <div className="bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/60">
            <h3 className="font-medium text-gray-800 text-lg">Backstory</h3>
          </div>
          <div className="p-6">
            <p className="text-base text-gray-700 whitespace-pre-line">{companion.backstory}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCompanionPage;