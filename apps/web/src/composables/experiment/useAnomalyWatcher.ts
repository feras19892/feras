import { ref, type Ref } from 'vue'

export interface AnomalyRule {
  name: string
  check: (state: Record<string, unknown>) => boolean
  severity: 'warn' | 'error' | 'fatal'
  message: string
}

export interface AnomalyReport {
  id: string
  experiment: string
  rule: string
  severity: 'warn' | 'error' | 'fatal'
  message: string
  timestamp: number
  stateSnapshot: Record<string, unknown>
}

const globalReports = ref<AnomalyReport[]>([])

export const defaultPhysicsRules: AnomalyRule[] = [
  {
    name: 'nan-infinity',
    check: (s) => Object.values(s).some((v) => typeof v === 'number' && (!Number.isFinite(v))),
    severity: 'fatal',
    message: 'NaN or Infinity detected in simulation state',
  },
  {
    name: 'negative-mass',
    check: (s) => (s.mass !== undefined && typeof s.mass === 'number' && s.mass < 0),
    severity: 'error',
    message: 'Negative mass detected',
  },
  {
    name: 'negative-time',
    check: (s) => (s.t !== undefined && typeof s.t === 'number' && s.t < 0),
    severity: 'error',
    message: 'Negative simulation time',
  },
  {
    name: 'excessive-velocity',
    check: (s) => (s.v !== undefined && typeof s.v === 'number' && Math.abs(s.v) > 1e6),
    severity: 'warn',
    message: 'Velocity exceeds 1,000,000 m/s — possible numerical instability',
  },
  {
    name: 'energy-gain',
    check: (s) => {
      if (s.KEi === undefined || s.KEf === undefined) return false
      const kei = s.KEi as number
      const kef = s.KEf as number
      return typeof kei === 'number' && typeof kef === 'number' && kef > kei * 1.001
    },
    severity: 'error',
    message: 'Kinetic energy increased without external force — conservation violation',
  },
]

let _idCounter = 0

export function useAnomalyWatcher(experimentName: string, rules: AnomalyRule[] = defaultPhysicsRules) {
  const active = ref(true)
  const localReports = ref<AnomalyReport[]>([])

  function inspect(state: Record<string, unknown>) {
    if (!active.value) return
    for (const rule of rules) {
      if (rule.check(state)) {
        const report: AnomalyReport = {
          id: `anomaly-${++_idCounter}`,
          experiment: experimentName,
          rule: rule.name,
          severity: rule.severity,
          message: rule.message,
          timestamp: performance.now(),
          stateSnapshot: { ...state },
        }
        localReports.value.push(report)
        if (localReports.value.length > 50) localReports.value.shift()
        globalReports.value.push(report)
        if (globalReports.value.length > 200) globalReports.value.shift()

        // Log with appropriate level
        const logPrefix = `[AnomalyWatcher][${experimentName}][${rule.severity.toUpperCase()}]`
        if (rule.severity === 'fatal') {
          console.error(logPrefix, rule.message, report.stateSnapshot)
        } else if (rule.severity === 'error') {
          console.error(logPrefix, rule.message, report.stateSnapshot)
        } else {
          console.warn(logPrefix, rule.message, report.stateSnapshot)
        }
      }
    }
  }

  function clear() {
    localReports.value = []
  }

  function pause() { active.value = false }
  function resume() { active.value = true }

  return { inspect, clear, pause, resume, localReports, active }
}

export function getGlobalReports(): Ref<AnomalyReport[]> {
  return globalReports
}
