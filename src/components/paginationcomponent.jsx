import PropTypes from 'prop-types';
import { usePagination, DOTS } from '../queryHooks/usepagination';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const Pagination = (props) => {
  const {
    onPageChange,
    totalCount,
    siblingCount = 2,
    currentPage,
    pageSize,
  } = props;
  // Use the custom hook to get the pagination range
  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  // Defensive check for pagination range
  if (!paginationRange || paginationRange.length < 2) {
    return null;
  }

  const lastPage = paginationRange[paginationRange.length - 1];

  const onNext = () => {
    if (currentPage < lastPage) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <ul className="pagination-container flex items-center justify-center">
      {/* Left navigation arrow */}
      <li
        className={`pagination-item ${
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={onPrevious}
      >
        <div className="arrow left">
          <ChevronLeftIcon />
        </div>
      </li>

      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <li key={`dots-${index}`} className="pagination-item">
              <span className="text-xs">&#8230;</span>
            </li>
          );
        }

        return (
          <li
            key={pageNumber}
            className={`pagination-item ${
              pageNumber === currentPage
                ? 'selected bg-[var(--primary-500)] text-[var(--neutral-white)]'
                : 'bg-[var(--neutral-white)] text-[var(--primary-500)]'
            } cursor-pointer px-2 py-1 mx-1 text-xs rounded-sm border border-[var(--primary-400)] transition-colors duration-300`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </li>
        );
      })}

      {/* Right navigation arrow */}
      <li
        className={`pagination-item ${
          currentPage === lastPage ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={onNext}
      >
        <div className="arrow right">
          <ChevronRightIcon />
        </div>
      </li>
    </ul>
  );
};

Pagination.propTypes = {
  onPageChange: PropTypes.func.isRequired,
  totalCount: PropTypes.number.isRequired,
  siblingCount: PropTypes.number,
  currentPage: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
};

export default Pagination;