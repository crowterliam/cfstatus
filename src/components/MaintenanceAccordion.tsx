'use client'

import { useState, useEffect } from 'react'
import { formatDateWithValidation } from '../lib/dateUtils'

interface Maintenance {
  id: string
  name: string
  status: string
  impact: string
  shortlink: string
  scheduled_for: string
  scheduled_until: string
  components: string[]
}

interface MaintenanceAccordionProps {
  title: string
  maintenances: Maintenance[]
  searchTerm?: string
}

export default function MaintenanceAccordion({ title, maintenances, searchTerm = '' }: MaintenanceAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Simple substring search function with null checks
  const matchesSearch = (text: string): boolean => {
    if (!searchTerm) return true
    if (!text) return false
    return text.toLowerCase().includes(searchTerm.toLowerCase())
  }

  // Filter maintenances based on search term
  const filteredMaintenances = maintenances.filter(maintenance =>
    matchesSearch(maintenance.name)
  )

  // Automatically open accordion if there are matching maintenances
  useEffect(() => {
    if (searchTerm && filteredMaintenances.length > 0) {
      setIsOpen(true)
    }
  }, [searchTerm, filteredMaintenances.length])

  // Hide accordion if no maintenances match the filters
  if (filteredMaintenances.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        <span className="text-gray-500 dark:text-gray-400">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          {filteredMaintenances.map((maintenance) => (
            <div key={maintenance.id} className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-800 dark:text-gray-200">{maintenance.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  maintenance.status === 'scheduled' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                  maintenance.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                  {maintenance.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Impact:</span>
                    <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{maintenance.impact}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Scheduled:</span>
                    <span className="ml-2 text-gray-800 dark:text-gray-200">
                      {formatDateWithValidation(maintenance.scheduled_for, 'N/A', 'Maintenance')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 dark:text-gray-300">Until:</span>
                    <span className="ml-2 text-gray-800 dark:text-gray-200">
                      {formatDateWithValidation(maintenance.scheduled_until, 'N/A', 'Maintenance')}
                    </span>
                  </div>
                </div>
              </div>

              {maintenance.shortlink && (
                <div className="mt-3">
                  <a
                    href={maintenance.shortlink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-200 text-sm underline"
                  >
                    View details
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}