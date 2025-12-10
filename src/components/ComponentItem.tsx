'use client'

import { statusColors, colors } from '../lib/statusColors'
import { formatDateWithValidation } from '../lib/dateUtils'

interface Component {
  id: string
  name: string
  status: keyof typeof statusColors
  updated_at: string
  group?: boolean
  components?: Component[]
}

export default function ComponentItem({ component }: { component: Component }) {
  const statusInfo = statusColors[component.status] || {
    color: colors.gray,
    text: 'Unknown Status'
  }

  return (
    <div className={`component-item ${component.status}`}>
      <div className="component-info">
        <div className="component-name">{component.name}</div>
        <div className="component-timestamp">
          Last updated: {formatDateWithValidation(component.updated_at, 'N/A', `Component: ${component.name}`)}
        </div>
      </div>

      <div className="component-status">
        <div className="status-dot" style={{ backgroundColor: statusInfo.color }} />
        <span className="status-text" style={{ color: statusInfo.color }}>
          {statusInfo.text}
        </span>
      </div>
    </div>
  )
}