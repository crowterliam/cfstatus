// Cloudflare brand colors
export const colors = {
  orange: '#FF6633',
  blue: '#2C7CB0',
  dark: '#1D1F20',
  lightGray: '#F5F5F5',
  gray: '#EAEBEB',
  white: '#FFFFFF',
  green: '#46A46C',
  yellow: '#FBAE40',
  red: '#DA304C'
} as const

// Status indicator mapping
export const statusColors = {
  operational: { color: colors.green, text: 'Operational' },
  partial_outage: { color: colors.yellow, text: 'Re-routed' },
  major_outage: { color: colors.red, text: 'Major Outage' },
  under_maintenance: { color: colors.blue, text: 'Partially Re-routed' },
  degraded_performance: { color: colors.yellow, text: 'Degraded Performance' }
} as const

export const overallStatusColors = {
  none: { color: colors.green, text: 'All Systems Operational' },
  minor: { color: colors.yellow, text: 'Minor Service Outage' },
  major: { color: colors.red, text: 'Major Service Outage' },
  critical: { color: colors.red, text: 'Critical Service Outage' }
} as const

export type StatusColorKey = keyof typeof statusColors
export type OverallStatusColorKey = keyof typeof overallStatusColors