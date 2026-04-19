import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

/**
 * Pagination Controls Component
 * Displays page navigation controls with current page info
 *
 * @param {Object} props
 * @param {number} props.currentPage - Current page number (0-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalElements - Total items across all pages
 * @param {number} props.pageSize - Items per page
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {boolean} props.isLoading - Loading state
 */
export function PaginationControls({
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange = () => {},
  isLoading = false,
}) {
  const hasPrevious = currentPage > 0
  const hasNext = currentPage < totalPages - 1
  const startItem = currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements)

  const handlePreviousPage = () => {
    if (hasPrevious && !isLoading) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (hasNext && !isLoading) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div className="flex items-center justify-between border-t border-border/50 bg-background/30 px-4 py-3 text-sm">
      <span className="text-muted-foreground">
        {totalElements > 0 ? `Showing ${startItem}-${endItem} of ${totalElements}` : 'No items'}
      </span>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={!hasPrevious || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="px-2 text-xs font-medium">
          Page {currentPage + 1} of {totalPages || 1}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!hasNext || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
