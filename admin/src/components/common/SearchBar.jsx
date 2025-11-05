import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaSearch } from 'react-icons/fa';

/**
 * Reusable search bar component
 * 
 * @param {Object} props - Component props
 * @param {string} props.initialValue - Initial search term
 * @param {Function} props.onSearch - Function to call when search is submitted
 * @param {string} props.placeholder - Placeholder text for the search input
 * @param {string} props.buttonText - Text for the search button
 * @param {boolean} props.autoSearch - Whether to search automatically on input change
 * @param {number} props.debounceMs - Debounce time in milliseconds for auto search
 */
const SearchBar = ({
  initialValue = '',
  onSearch,
  placeholder = 'Search...',
  buttonText = 'Search',
  autoSearch = false,
  debounceMs = 500
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // If autoSearch is enabled, debounce the search
    if (autoSearch) {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      const timeoutId = setTimeout(() => {
        onSearch(value);
      }, debounceMs);

      setDebounceTimeout(timeoutId);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#151529]" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:border-[#151529]"
            aria-label={placeholder}
          />
        </div>
        <button 
          type="submit"
          className="ml-2 px-4 py-2 bg-[#151529] text-white hover:bg-gray-600 transition-colors text-xs"
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
};

SearchBar.propTypes = {
  initialValue: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  buttonText: PropTypes.string,
  autoSearch: PropTypes.bool,
  debounceMs: PropTypes.number
};

export default SearchBar;