/**
 * Client-side logger.
 *
 * Strategy:
 * - Writes to localStorage immediately (synchronous, survives page crash/hang)
 * - Batches server writes: accumulates entries, flushes every FLUSH_INTERVAL_MS
 *   OR when FLUSH_BATCH_SIZE is reached — never one-request-per-log
 * - On reload: flushBufferedLogs drains localStorage in a single batch call
 */

const LS_KEY = 'app_log_buffer'
const MAX_LS_ENTRIES = 500
const FLUSH_INTERVAL_MS = 2000  // flush at most every 2s
const FLUSH_BATCH_SIZE = 20     // or when 20 entries accumulate

type LogEntry = { timestamp: string; level: string; message: string; data?: string }
type WriteBatchFn = (opts: { data: { entries: LogEntry[] } }) => Promise<unknown>

let _writeFn: WriteBatchFn | null = null
let _pending: LogEntry[] = []
let _timer: ReturnType<typeof setTimeout> | null = null

function ts() {
  return new Date().toISOString()
}

function writeLS(entry: LogEntry) {
  try {
    const buf = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as LogEntry[]
    buf.push(entry)
    if (buf.length > MAX_LS_ENTRIES) buf.splice(0, buf.length - MAX_LS_ENTRIES)
    localStorage.setItem(LS_KEY, JSON.stringify(buf))
  } catch { /* ignore */ }
}

function scheduleFlush() {
  if (!_writeFn) return
  if (_timer !== null) return // already scheduled
  _timer = setTimeout(doFlush, FLUSH_INTERVAL_MS)
}

function doFlush() {
  _timer = null
  if (!_writeFn || _pending.length === 0) return
  const batch = _pending.splice(0)
  _writeFn({ data: { entries: batch } }).catch(() => {
    // server write failed — localStorage is the backup, nothing to do
  })
}

function enqueue(entry: LogEntry) {
  _pending.push(entry)
  if (_pending.length >= FLUSH_BATCH_SIZE) {
    if (_timer !== null) { clearTimeout(_timer); _timer = null }
    doFlush()
  } else {
    scheduleFlush()
  }
}

function serialize(a: unknown): string {
  if (typeof a === 'string') return a
  if (a instanceof Error) return `${a.name}: ${a.message}${a.stack ? '\n' + a.stack : ''}`
  try { return JSON.stringify(a) ?? String(a) } catch { return String(a) }
}

function capture(level: string, args: unknown[]) {
  const message = args.map(serialize).join(' ')
  const entry: LogEntry = { timestamp: ts(), level, message }
  writeLS(entry)
  enqueue(entry)
}

export function initLogger(writeFn: WriteBatchFn) {
  if (typeof window === 'undefined') return
  _writeFn = writeFn

  const _log = console.log.bind(console)
  const _warn = console.warn.bind(console)
  const _error = console.error.bind(console)

  console.log = (...args) => { _log(...args); capture('info', args) }
  console.warn = (...args) => { _warn(...args); capture('warn', args) }
  console.error = (...args) => { _error(...args); capture('error', args) }

  window.onerror = (msg, src, line, col, err) => {
    const message = `${msg} @ ${src}:${line}:${col}`
    const entry: LogEntry = { timestamp: ts(), level: 'error', message, data: err?.stack }
    writeLS(entry)
    // Force-flush errors immediately (don't batch)
    if (_writeFn) {
      _writeFn({ data: { entries: [entry] } }).catch(() => {})
    }
    return false
  }

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason
    const message = reason instanceof Error
      ? `UnhandledRejection: ${reason.name}: ${reason.message}`
      : `UnhandledRejection: ${serialize(reason)}`
    const entry: LogEntry = { timestamp: ts(), level: 'error', message, data: reason?.stack }
    writeLS(entry)
    // Force-flush errors immediately
    if (_writeFn) {
      _writeFn({ data: { entries: [entry] } }).catch(() => {})
    }
  })

  // Flush on page hide (tab close / navigate away)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') doFlush()
  })

  enqueue({ timestamp: ts(), level: 'info', message: `=== SESSION START === ${window.location.href}` })
}

export function readLSLogs(): LogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export async function flushBufferedLogs(writeFn: WriteBatchFn) {
  const entries = readLSLogs()
  if (!entries.length) return
  const tagged = entries.map((e) => ({ ...e, message: `[BUFFERED] ${e.message}` }))
  // Single batch call for all buffered entries
  await writeFn({ data: { entries: tagged } }).catch(() => {})
  localStorage.removeItem(LS_KEY)
}
