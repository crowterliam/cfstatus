'use client'

interface SearchBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  showOnlyIssues: boolean
  setShowOnlyIssues: (show: boolean) => void
  onQuickFilter: (filter: string) => void
}

export default function SearchBar({
  searchTerm,
  setSearchTerm
}: SearchBarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px]">
          <label className="block text-sm text-gray-800 dark:text-gray-200 mb-2">Search Components</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name (e.g. 'api', 'dns', 'workers')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">🔍</div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}