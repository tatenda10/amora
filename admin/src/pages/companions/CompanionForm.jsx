import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../context/Api';
import { FaSpinner, FaSave, FaArrowLeft, FaUpload, FaTimes } from 'react-icons/fa';

// Helper function to get full image URL
const getImageUrl = (path) => {
  if (!path) return null;
  // Remove /api from BASE_URL for static files
  const serverUrl = BASE_URL.replace('/api', '');
  return `${serverUrl}${path}`;
};

const CompanionForm = ({ mode = 'add', initialData = null }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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

  // Log initial data
  console.log('Initial data received:', initialData);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    age: initialData?.age || '',
    gender: initialData?.gender || '',
    country: initialData?.country || '',
    ethnicity: initialData?.ethnicity || '',
    personality: initialData?.personality || '',
    traits: safeJSONParse(initialData?.traits),
    interests: safeJSONParse(initialData?.interests),
    backstory: initialData?.backstory || ''
  });

  // Log parsed form data
  console.log('Initial form data:', formData);

  const [newTrait, setNewTrait] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [profilePreview, setProfilePreview] = useState(
    initialData?.profile_image_url ? getImageUrl(initialData.profile_image_url) : null
  );
  const [galleryPreviews, setGalleryPreviews] = useState(
    safeJSONParse(initialData?.gallery_images).map(path => getImageUrl(path))
  );
  // Keep track of existing gallery paths separately from previews
  const [existingGalleryPaths, setExistingGalleryPaths] = useState(
    safeJSONParse(initialData?.gallery_images)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTrait = () => {
    if (newTrait.trim()) {
      setFormData(prev => ({
        ...prev,
        traits: [...prev.traits, newTrait.trim()]
      }));
      setNewTrait('');
    }
  };

  const handleRemoveTrait = (index) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.filter((_, i) => i !== index)
    }));
  };

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (index) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryImages(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (index) => {
    // If it's an existing image (has a server path), remove it from existingGalleryPaths
    if (index < existingGalleryPaths.length) {
      setExistingGalleryPaths(prev => prev.filter((_, i) => i !== index));
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      // If it's a new image, remove it from galleryImages
      const adjustedIndex = index - existingGalleryPaths.length;
      setGalleryImages(prev => prev.filter((_, i) => i !== adjustedIndex));
      setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Log the form data before submission
      console.log('Submitting form data:', {
        mode,
        formData,
        profileImage,
        galleryImages,
        existingGalleryPaths
      });

      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'traits' || key === 'interests') {
          // Ensure arrays are properly stringified
          const value = Array.isArray(formData[key]) ? JSON.stringify(formData[key]) : formData[key];
          formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, formData[key] || '');
        }
      });

      // Handle profile image
      if (profileImage) {
        formDataToSend.append('profile_image', profileImage);
      } else if (mode === 'edit' && initialData.profile_image_url) {
        // Keep existing profile image in edit mode
        formDataToSend.append('profile_image_url', initialData.profile_image_url);
      }

      // Handle gallery images
      if (mode === 'edit') {
        // In edit mode, send the existing gallery paths (not the blob URLs)
        formDataToSend.append('existing_gallery', JSON.stringify(existingGalleryPaths));
      }
      
      // Add new gallery images if any
      if (galleryImages.length > 0) {
        galleryImages.forEach(image => {
          formDataToSend.append('new_gallery_images', image);
        });
      }

      const url = mode === 'edit' 
        ? `${BASE_URL}/companions/${initialData.id}`
        : `${BASE_URL}/companions`;

      // Log request details
      console.log('\n=== FORM SUBMISSION ===');
      console.log('Mode:', mode);
      console.log('URL:', url);
      console.log('Method:', mode === 'edit' ? 'PUT' : 'POST');
      console.log('FormData entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1]);
      }
      console.log('=== END FORM SUBMISSION ===\n');

      const response = await axios({
        method: mode === 'edit' ? 'put' : 'post',
        url,
        data: formDataToSend,
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
        }
      });

      navigate('/companions');
    } catch (err) {
      console.error('Error submitting form:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to save companion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 text-sm"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ethnicity
          </label>
          <input
            type="text"
            name="ethnicity"
            value={formData.ethnicity}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 text-sm"
          />
        </div>
      </div>

      {/* Personality */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Personality
        </label>
        <textarea
          name="personality"
          value={formData.personality}
          onChange={handleInputChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 text-sm"
        />
      </div>

      {/* Traits */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Traits
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTrait}
            onChange={(e) => setNewTrait(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 text-sm"
            placeholder="Add a trait"
          />
          <button
            type="button"
            onClick={handleAddTrait}
            className="px-4 py-2 bg-[#FFB6B9] text-white hover:bg-[#ffa7ab]"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.traits.map((trait, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-50 border border-gray-200 text-sm flex items-center rounded-full"
            >
              {trait}
              <button
                type="button"
                onClick={() => handleRemoveTrait(index)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interests
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 text-sm"
            placeholder="Add an interest"
          />
          <button
            type="button"
            onClick={handleAddInterest}
            className="px-4 py-2 bg-[#FFB6B9] text-white hover:bg-[#ffa7ab]"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.interests.map((interest, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-50 border border-gray-200 text-sm flex items-center rounded-full"
            >
              {interest}
              <button
                type="button"
                onClick={() => handleRemoveInterest(index)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Backstory */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Backstory
        </label>
        <textarea
          name="backstory"
          value={formData.backstory}
          onChange={handleInputChange}
          required
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 text-sm"
        />
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Image
          </label>
          <div className="space-y-2">
            {profilePreview && (
              <img
                src={profilePreview}
                alt="Profile preview"
                className="w-32 h-32 object-cover border border-gray-200 rounded-lg"
              />
            )}
            <label className="block">
              <span className="sr-only">Choose profile photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#FFB6B9] file:text-white
                  hover:file:bg-[#ffa7ab]"
              />
            </label>
          </div>
        </div>

        {/* Gallery Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gallery Images
          </label>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              {galleryPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Gallery preview ${index + 1}`}
                    className="w-full h-24 object-cover border border-gray-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 p-1 bg-[#FFB6B9] text-white hover:bg-[#ffa7ab] rounded-full"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="block">
              <span className="sr-only">Choose gallery photos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryImagesChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#FFB6B9] file:text-white
                  hover:file:bg-[#ffa7ab]"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate('/companions')}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center px-4 py-2 bg-[#FFB6B9] text-white hover:bg-[#ffa7ab] disabled:opacity-50"
        >
          {loading ? (
            <FaSpinner className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <FaSave className="w-5 h-5 mr-2" />
              Save
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CompanionForm; 