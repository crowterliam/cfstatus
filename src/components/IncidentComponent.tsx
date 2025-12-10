'use client'

import { colors } from '../lib/statusColors'

interface IncidentUpdate {
  body: string
  created_at: string
  display_at: string
  id: string
  incident_id: string
  status: string
  updated_at: string
}

interface Incident {
  created_at: string
  id: string
  impact: string
  incident_updates: IncidentUpdate[]
  monitoring_at: string | null
  name: string
  page_id: string
  resolved_at: string | null
  shortlink: string
  status: string
  updated_at: string
}

interface IncidentComponentProps {
  incidents: Incident[]
}

export default function IncidentComponent({ incidents }: IncidentComponentProps) {
  if (incidents.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-8 border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">✅ All Systems Operational</h3>
        <p className="text-green-700 dark:text-green-300">No unresolved incidents detected.</p>
      </div>
    )
  }

  // Determine overall status based on incidents
  const hasCritical = incidents.some(incident => incident.impact === 'critical')
  const hasMajor = incidents.some(incident => incident.impact === 'major')

  let statusColor: string = colors.yellow
  let statusText = 'Minor Service Issues'

  if (hasCritical) {
    statusColor = colors.red
    statusText = 'Critical Service Outage'
  } else if (hasMajor) {
    statusColor = colors.red
    statusText = 'Major Service Outage'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Overall Status */}
      <div className="flex items-center mb-6">
        <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: statusColor }} />
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{statusText}</h3>
      </div>

      {/* Incidents List */}
      <div className="space-y-6">
        {incidents.map((incident) => (
          <div key={incident.id} className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">{incident.name}</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                incident.impact === 'critical' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                incident.impact === 'major' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              }`}>
                {incident.impact.replace('_', ' ').toUpperCase()} IMPACT
              </span>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Status: <span className="font-medium capitalize">{incident.status}</span>
            </div>

            {/* Latest Update */}
            {incident.incident_updates.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-gray-700 dark:text-gray-200 text-sm mb-2">
                  <strong>Latest Update:</strong> {incident.incident_updates[0].body}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Updated: {new Date(incident.incident_updates[0].updated_at).toLocaleString()}
                </p>
              </div>
            )}

            {incident.shortlink && (
              <div className="mt-3">
                <a
                  href={incident.shortlink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-200 text-sm underline"
                >
                  View incident details
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}