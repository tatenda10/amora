import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../../context/Api';
import { FaPlus, FaEdit, FaEye, FaTrash, FaSpinner } from 'react-icons/fa';
import usePagination from '../../hooks/usePagination';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';

// Helper function to get full image URL
const getImageUrl = (path) => {
  if (!path) return null;
  // Remove /api from BASE_URL for static files
  const serverUrl = BASE_URL.replace('/api', '');
  return `${serverUrl}${path}`;
};

const CompanionsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use the custom pagination hook
  const {
    data: companions,
    loading,
    error,
    pagination,
    goToPage,
    updateFilters,
    refresh
  } = usePagination(`${BASE_URL}/companions`, {
    initialPage: 1,
    pageSize: 10,
    initialFilters: { search: '' },
    dataProcessor: (data) => data // No additional processing needed
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this companion?')) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/companions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete companion');
      }
      
      // Update the companions list after deletion
      if (companions.length === 1 && pagination.currentPage > 1) {
        // If deleting the last item on a page, go to previous page
        goToPage(pagination.currentPage - 1);
      } else {
        // Otherwise just refresh the current page
        refresh();
      }
    } catch (err) {
      console.error('Error deleting companion:', err);
      alert(err.message || 'Failed to delete companion');
    }
  };

  // Handle search term changes
  const handleSearch = (term) => {
    setSearchTerm(term);
    updateFilters({ search: term });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="w-8 h-8 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Companions</h1>
        <button
          onClick={() => navigate('/companions/add')}
          className="flex items-center px-3 py-1.5 bg-[#151529] text-white hover:bg-gray-600 transition-colors text-xs"
        >
          <FaPlus className="w-3 h-3 mr-1.5" />
          Add Companion
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchBar 
          initialValue={searchTerm}
          onSearch={handleSearch}
          placeholder="Search companions..."
          buttonText="Search"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-2 text-left text-xs font-semibold tracking-wider text-gray-700">Name</th>
              <th className="px-4 py-2 text-left text-xs font-semibold tracking-wider text-gray-700">Age</th>
              <th className="px-4 py-2 text-left text-xs font-semibold tracking-wider text-gray-700">Gender</th>
              <th className="px-4 py-2 text-left text-xs font-semibold tracking-wider text-gray-700">Country</th>
              <th className="px-4 py-2 text-left text-xs font-semibold tracking-wider text-gray-700">Ethnicity</th>
              <th className="px-4 py-2 text-right text-xs font-semibold tracking-wider text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {companions.map((companion) => (
              <tr key={companion.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs">
                  <div className="flex items-center">
                    {companion.profile_image_url && (
                      <img
                        src={getImageUrl(companion.profile_image_url)}
                        alt={companion.name}
                        className="w-8 h-8 mr-3 object-cover rounded-full"
                      />
                    )}
                    {companion.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{companion.age}</td>
                <td className="px-4 py-3 text-xs">{companion.gender}</td>
                <td className="px-4 py-3 text-xs">{companion.country}</td>
                <td className="px-4 py-3 text-xs">{companion.ethnicity}</td>
                <td className="px-4 py-3 text-xs">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => navigate(`/companions/view/${companion.id}`)}
                      className="p-1 text-[#151529] hover:text-gray-600"
                      title="View"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/companions/edit/${companion.id}`)}
                      className="p-1 text-[#151529] hover:text-gray-600"
                      title="Edit"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(companion.id)}
                      className="p-1 text-[#151529] hover:text-gray-600"
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <Pagination 
        pagination={pagination}
        onPageChange={goToPage}
        itemName="companions"
      />
    </div>
  );
};

export default CompanionsPage;