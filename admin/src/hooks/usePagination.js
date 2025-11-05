import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for handling pagination with API requests
 * 
 * @param {string} url - The base API URL to fetch data from
 * @param {Object} options - Configuration options
 * @param {number} options.initialPage - Initial page number (default: 1)
 * @param {number} options.pageSize - Number of items per page (default: 10)
 * @param {Object} options.initialFilters - Initial filter parameters
 * @param {Function} options.dataProcessor - Optional function to process the response data
 * @returns {Object} Pagination state and control functions
 */
const usePagination = (url, options = {}) => {
  const {
    initialPage = 1,
    pageSize = 10,
    initialFilters = {},
    dataProcessor = (data) => data,
  } = options;

  // State for data and pagination
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  
  // Pagination metadata
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    total: 0,
    pageSize,
    hasNext: false,
    hasPrev: false
  });

  /**
   * Fetch data with current pagination and filters
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(url, {
        params: {
          page: pagination.currentPage,
          limit: pagination.pageSize,
          ...filters
        }
      });

      // Process the response data
      const processedData = dataProcessor(response.data.data);
      setData(processedData);
      
      // Update pagination metadata
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
      
      setError(null);
    } catch (err) {
      console.error(`Error fetching data from ${url}:`, err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [url, pagination.currentPage, pagination.pageSize, filters, dataProcessor]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Change the current page
   * @param {number} page - The page number to navigate to
   */
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
    }
  }, [pagination.totalPages]);

  /**
   * Update filters and reset to first page
   * @param {Object} newFilters - The new filter values
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  /**
   * Refresh the current page data
   */
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    // Data
    data,
    loading,
    error,
    
    // Pagination state
    pagination,
    
    // Filter state
    filters,
    
    // Actions
    goToPage,
    updateFilters,
    refresh
  };
};

export default usePagination;