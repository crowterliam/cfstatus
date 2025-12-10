'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import SearchBar from '../components/SearchBar'
import ComponentItem from '../components/ComponentItem'
import MaintenanceAccordion from '../components/MaintenanceAccordion'
import ServiceGroupAccordion from '../components/ServiceGroupAccordion'
import { overallStatusColors, colors, StatusColorKey, OverallStatusColorKey } from '../lib/statusColors'
import { formatDateWithValidation } from '../lib/dateUtils'
import IncidentComponent from '../components/IncidentComponent'

interface Component {
  id: string
  name: string
  status: StatusColorKey
  updated_at: string
  group?: boolean
  components?: Component[]
  group_id?: string | null
  position?: number
  page_id?: string
}

interface StatusData {
  page: {
    name: string
    updated_at: string
  }
  status: {
    indicator: OverallStatusColorKey
    description: string
  }
}

interface ComponentsData {
  page: {
    name: string
    updated_at: string
  }
  components: Component[]
}

interface Maintenance {
  id: string
  name: string
  status: string
  impact: string
  shortlink: string
  scheduled_for: string
  scheduled_until: string
  components: string[]
  page_id: string
}

interface MaintenanceData {
  page: {
    name: string
    updated_at: string
  }
  scheduled_maintenances: Maintenance[]
}

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

interface IncidentsData {
  page: {
    name: string
    updated_at: string
  }
  incidents: Incident[]
}

export default function CloudflareStatusPage() {
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [componentsData, setComponentsData] = useState<ComponentsData | null>(null)
  const [incidentsData, setIncidentsData] = useState<IncidentsData | null>(null)
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<Maintenance[]>([])
  const [activeMaintenance, setActiveMaintenance] = useState<Maintenance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showOnlyIssues, setShowOnlyIssues] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Simple search function with null checks
  const matchesSearch = (componentName: string): boolean => {
    if (!searchTerm) return true
    if (!componentName) return false
    return componentName.toLowerCase().includes(searchTerm.toLowerCase())
  }

  // Check if component matches status filter
  const matchesStatusFilter = (component: Component): boolean => {
    if (!showOnlyIssues) return true
    return component.status !== 'operational'
  }

  // Filter a flat list of components by search and status
  const filterFlatComponents = (components: Component[]): Component[] => {
    return components.filter(component =>
      matchesSearch(component.name) && matchesStatusFilter(component)
    )
  }

  // Group components by their parent groups and separate Points of Presence
  const organizeComponents = (components: Component[]) => {
    const pointsOfPresence: Component[] = []
    const parentGroups: Record<string, {parent: Component, children: Component[]}> = {}

    // First pass: identify parent groups (components without group_id but are groups)
    // and individual components (components with group_id)
    components.forEach(component => {
      if (component.group && !component.group_id) {
        // This is a parent group component
        parentGroups[component.id] = {
          parent: component,
          children: []
        }
      }
    })

    // Second pass: organize components with group_id under their parent groups
    components.forEach(component => {
      if (component.group_id && parentGroups[component.group_id]) {
        // This component belongs to a parent group
        parentGroups[component.group_id].children.push(component)
      } else if (!component.group_id) {
        // Points of Presence typically have airport codes in parentheses and no group_id
        const hasAirportCode = /\([A-Z]{3}\)/.test(component.name)
        if (hasAirportCode) {
          pointsOfPresence.push(component)
        }
      }
    })

    // Convert parentGroups object to array and sort by position
    const sortedParentGroups = Object.values(parentGroups)
      .sort((a, b) => (a.parent.position || 0) - (b.parent.position || 0))

    // Sort children within each parent group by position
    sortedParentGroups.forEach(group => {
      group.children.sort((a, b) => (a.position || 0) - (b.position || 0))
    })

    return { pointsOfPresence, parentGroups: sortedParentGroups }
  }

  // Organize all components first, then filter will be applied in rendering
  const { pointsOfPresence, parentGroups } = componentsData
    ? organizeComponents(componentsData.components)
    : { pointsOfPresence: [], parentGroups: [] }

  // Apply filters to Points of Presence
  const filteredPointsOfPresence = filterFlatComponents(pointsOfPresence)

  // Determine header status based only on incidents
  const determineHeaderStatus = () => {
    // Only use incidents to determine the current status
    if (incidentsData && incidentsData.incidents.length > 0) {
      const hasCritical = incidentsData.incidents.some(incident => incident.impact === 'critical')
      const hasMajor = incidentsData.incidents.some(incident => incident.impact === 'major')

      if (hasCritical) {
        return {
          indicator: 'critical' as OverallStatusColorKey,
          description: 'Critical Service Outage'
        }
      } else if (hasMajor) {
        return {
          indicator: 'major' as OverallStatusColorKey,
          description: 'Major Service Outage'
        }
      } else {
        return {
          indicator: 'minor' as OverallStatusColorKey,
          description: 'Minor Service Issues'
        }
      }
    }

    // Default to operational if no incidents
    return {
      indicator: 'none' as OverallStatusColorKey,
      description: 'All Systems Operational'
    }
  }

  const headerStatus = determineHeaderStatus()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only show loading state on initial load
        if (isInitialLoad) {
          setLoading(true)
        }
        setError(null)

        // Fetch status data
        const statusResponse = await fetch('https://www.cloudflarestatus.com/api/v2/status.json')
        if (!statusResponse.ok) throw new Error('Failed to fetch status data')

        // Fetch components data
        const componentsResponse = await fetch('https://www.cloudflarestatus.com/api/v2/components.json')
        if (!componentsResponse.ok) throw new Error('Failed to fetch components data')

        // Fetch upcoming maintenance data
        const upcomingMaintenanceResponse = await fetch('https://www.cloudflarestatus.com/api/v2/scheduled-maintenances/upcoming.json')
        if (!upcomingMaintenanceResponse.ok) throw new Error('Failed to fetch upcoming maintenance data')

        // Fetch active maintenance data
        const activeMaintenanceResponse = await fetch('https://www.cloudflarestatus.com/api/v2/scheduled-maintenances/active.json')
        if (!activeMaintenanceResponse.ok) throw new Error('Failed to fetch active maintenance data')

        // Fetch unresolved incidents data
        const incidentsResponse = await fetch('https://www.cloudflarestatus.com/api/v2/incidents/unresolved.json')
        if (!incidentsResponse.ok) throw new Error('Failed to fetch incidents data')

        const statusData: StatusData = await statusResponse.json()
        const componentsData: ComponentsData = await componentsResponse.json()
        const upcomingMaintenanceData: MaintenanceData = await upcomingMaintenanceResponse.json()
        const activeMaintenanceData: MaintenanceData = await activeMaintenanceResponse.json()
        const incidentsData: IncidentsData = await incidentsResponse.json()

        setStatusData(statusData)
        setComponentsData(componentsData)
        setIncidentsData(incidentsData)
        setUpcomingMaintenance(upcomingMaintenanceData.scheduled_maintenances || [])
        setActiveMaintenance(activeMaintenanceData.scheduled_maintenances || [])
        
        // Mark initial load as complete
        if (isInitialLoad) {
          setIsInitialLoad(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch status data')
        console.error('Error fetching status data:', err)
      } finally {
        // Only clear loading state on initial load
        if (isInitialLoad) {
          setLoading(false)
        }
      }
    }

    fetchData()

    // Refresh data every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [isInitialLoad])

  const handleQuickFilter = (filter: string) => {
    setSearchTerm(filter)
  }

  return (
    <div className="status-page">
      <Head>
        <title>Cloudflare System Status</title>
        <meta name="description" content="Cloudflare System Status Page" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      {/* Header */}
      <header className="status-header">
        <div className="header-content">
          <div className="logo-title">
            <div className="cf-logo">
              <span>CF</span>
            </div>
            <h1>Cloudflare Status</h1>
          </div>

          <div className="status-info">
            <div className="status-indicator">
              <div className="indicator-dot" style={{
                backgroundColor: headerStatus ?
                  overallStatusColors[headerStatus.indicator]?.color :
                  colors.gray
              }} />
              <span className="status-text">
                {headerStatus ? headerStatus.description : 'Loading...'}
              </span>
            </div>
            <span className="last-updated">
              Last updated: {statusData ? formatDateWithValidation(statusData.page.updated_at, 'Loading...', 'Status Header') : 'Loading...'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="status-main">
        {/* Search Bar Component */}
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showOnlyIssues={showOnlyIssues}
          setShowOnlyIssues={setShowOnlyIssues}
          onQuickFilter={handleQuickFilter}
        />

        {/* Loading state */}
        {loading && (
          <div className="loading-state">
            <div className="loading-text">Loading...</div>
            <p className="loading-message">Fetching Cloudflare status data...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <div className="error-title">Error</div>
            <p className="error-message">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        )}

        {/* Incident Status Section - This now defines the current status */}
        {!loading && !error && incidentsData && (
          <div className="status-summary">
            <h2 className="summary-title">Current Status</h2>

            <IncidentComponent incidents={incidentsData.incidents} />
          </div>
        )}

        {/* Maintenance Sections */}
        {!loading && !error && (
          <div className="mb-8">
            <MaintenanceAccordion
              title={`Active Maintenance (${activeMaintenance.length})`}
              maintenances={activeMaintenance}
              searchTerm={searchTerm}
            />
            <MaintenanceAccordion
              title={`Upcoming Maintenance (${upcomingMaintenance.length})`}
              maintenances={upcomingMaintenance}
              searchTerm={searchTerm}
            />
          </div>
        )}

        {/* Points of Presence Section */}
        {!loading && !error && componentsData && filteredPointsOfPresence.length > 0 && (
          <div className="components-section">
            <h2 className="section-title">Points of Presence ({filteredPointsOfPresence.length})</h2>

            <div className="components-grid">
              {filteredPointsOfPresence.map((component) => (
                <ComponentItem key={component.id} component={component} />
              ))}
            </div>
          </div>
        )}

        {/* Services Section - Now organized by parent groups with accordions */}
        {!loading && !error && componentsData && parentGroups.length > 0 && (
          <div className="components-section">
            <h2 className="section-title">Cloudflare Services by Region</h2>

            <div className="components-grid">
              {parentGroups.map((group) => (
                <ServiceGroupAccordion
                  key={group.parent.id}
                  group={group}
                  searchTerm={searchTerm}
                  showOnlyIssues={showOnlyIssues}
                />
              ))}
            </div>
          </div>
        )}

        {/* No results state */}
        {!loading && !error && componentsData && filteredPointsOfPresence.length === 0 && parentGroups.length === 0 && (
          <div className="no-results">
            <p>No components match your search criteria.</p>
            {showOnlyIssues && <p>Try disabling &quot;Show only issues&quot; to see all components.</p>}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="status-footer">
        <p>Cloudflare Status Page | Data refreshed automatically every 60 seconds</p>
      </footer>
    </div>
  )
}