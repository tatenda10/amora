import React from 'react';
import PropTypes from 'prop-types';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Reusable pagination component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.pagination - Pagination state object
 * @param {number} props.pagination.currentPage - Current page number
 * @param {number} props.pagination.totalPages - Total number of pages
 * @param {number} props.pagination.total - Total number of items
 * @param {number} props.pagination.pageSize - Number of items per page
 * @param {boolean} props.pagination.hasNext - Whether there is a next page
 * @param {boolean} props.pagination.hasPrev - Whether there is a previous page
 * @param {Function} props.onPageChange - Function to call when page changes
 * @param {string} props.itemName - Name of the items being paginated (default: "items")
 */
const Pagination = ({ pagination, onPageChange, itemName = 'items' }) => {
  const {
    currentPage,
    totalPages,
    total,
    pageSize,
    hasNext,
    hasPrev
  } = pagination;

  // Calculate the range of items being displayed
  const startItem = total > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="mt-6 flex justify-between items-center">
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {total} {itemName}
      </div>
      
      {totalPages > 1 && (
        <div className="flex space-x-2">
          {/* Previous page button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrev}
            className={`p-2 border ${!hasPrev ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-[#151529] hover:bg-gray-50'}`}
            aria-label="Previous page"
          >
            <FaChevronLeft className="w-3 h-3" />
          </button>
          
          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              // Show current page, first and last page, and pages around current page
              return page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1);
            })
            .map((page, index, array) => {
              // Add ellipsis
              const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
              const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
              
              return (
                <React.Fragment key={page}>
                  {showEllipsisBefore && <span className="p-2 border bg-gray-50">...</span>}
                  <button
                    onClick={() => onPageChange(page)}
                    className={`p-2 min-w-[2rem] border ${currentPage === page ? 'bg-[#151529] text-white' : 'hover:bg-gray-50'}`}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                  {showEllipsisAfter && <span className="p-2 border bg-gray-50">...</span>}
                </React.Fragment>
              );
            })}
          
          {/* Next page button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className={`p-2 border ${!hasNext ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-[#151529] hover:bg-gray-50'}`}
            aria-label="Next page"
          >
            <FaChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

Pagination.propTypes = {
  pagination: PropTypes.shape({
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    hasNext: PropTypes.bool.isRequired,
    hasPrev: PropTypes.bool.isRequired
  }).isRequired,
  onPageChange: PropTypes.func.isRequired,
  itemName: PropTypes.string
};

export default Pagination;