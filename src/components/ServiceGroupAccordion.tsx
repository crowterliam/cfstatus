'use client'

import { useState, useEffect } from 'react'
import ComponentItem from './ComponentItem'

interface Component {
  id: string
  name: string
  status: 'operational' | 'partial_outage' | 'major_outage' | 'under_maintenance' | 'degraded_performance'
  updated_at: string
  group?: boolean
  components?: Component[]
  group_id?: string | null
  position?: number
  page_id?: string
}

interface ServiceGroupAccordionProps {
  group: {
    parent: Component
    children: Component[]
  }
  searchTerm?: string
  showOnlyIssues?: boolean
}

export default function ServiceGroupAccordion({ group, searchTerm = '', showOnlyIssues = false }: ServiceGroupAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Simple substring search function with null checks
  const matchesSearch = (text: string): boolean => {
    if (!searchTerm) return true
    if (!text) return false
    return text.toLowerCase().includes(searchTerm.toLowerCase())
  }

  // Check if component matches status filter
  const matchesStatusFilter = (component: Component): boolean => {
    if (!showOnlyIssues) return true
    return component.status !== 'operational'
  }

  // Filter children based on search term and status
  const filteredChildren = group.children.filter(child =>
    matchesSearch(child.name) && matchesStatusFilter(child)
  )

  // Check if any child component matches the search term
  const hasMatchingChildren = filteredChildren.length > 0

  // Automatically open accordion if there are matching children
  useEffect(() => {
    if (searchTerm && hasMatchingChildren) {
      setIsOpen(true)
    }
  }, [searchTerm, hasMatchingChildren])

  // Hide accordion if no children match the filters
  if (filteredChildren.length === 0) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{group.parent.name}</h3>
        <span className="text-gray-500 dark:text-gray-400">
          {isOpen ? '▼' : '▶'}
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          <div className="grid gap-3">
            {filteredChildren.map((subComponent) => (
              <ComponentItem key={subComponent.id} component={subComponent} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}