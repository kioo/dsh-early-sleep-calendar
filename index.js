/**
 * DSH Early Sleep Calendar — host half.
 *
 * Owns the check-in records and exposes them as
 * `GET|POST|DELETE /api/early-sleep/records`:
 *
 *  - GET    → `{ ok:true, generatedAt, records:[{date,time,note,createdAt}…] }`
 *  - POST   body `{date:"YYYY-MM-DD", time?:"HH:MM", note?:"…"}` → upsert one
 *             day, returns the full list (one record per date).
 *  - DELETE `?date=YYYY-MM-DD` (or a JSON body with `date`) → remove one day,
 *             returns the full list.
 *
 * Records persist to a JSON file (default `<DSH_HOME>/early-sleep/records.json`,
 * override with `config.dataFile`). Writes are atomic (tmp file + rename) and
 * serialized through a promise queue so concurrent requests cannot interleave.
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const ROUTE_PATH = '/api/early-sleep/records'
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const DEFAULT_TIME = '23:00'
const MAX_NOTE_LENGTH = 200
const MAX_RECORDS = 20000

// ---------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------

function errorMessage(error) {
  if (error instanceof Error && typeof error.message === 'string' && error.message !== '') return error.message
  try {
    return String(error)
  } catch {
    return 'unknown error'
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Strict calendar-date check on top of the format regex (rejects 2026-02-31). */
function isValidDate(date) {
  if (typeof date !== 'string' || !DATE_RE.test(date)) return false
  const year = Number(date.slice(0, 4))
  const month = Number(date.slice(5, 7))
  const day = Number(date.slice(8, 10))
  const probe = new Date(Date.UTC(year, month - 1, day))
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  )
}

function normalizeTime(value) {
  if (value === undefined || value === null || value === '') return DEFAULT_TIME
  if (typeof value === 'string' && TIME_RE.test(value)) return value
  return null
}

function normalizeNote(value) {
  if (value === undefined || value === null) return ''
  if (typeof value !== 'string') return null
  return value.slice(0, MAX_NOTE_LENGTH)
}

function normalizeStoredRecord(value) {
  if (!isRecord(value)) return null
  if (!isValidDate(value.date)) return null
  const time = normalizeTime(value.time)
  if (time === null) return null
  const note = normalizeNote(value.note)
  if (note === null) return null
  const createdAt =
    typeof value.createdAt === 'number' && Number.isFinite(value.createdAt) && value.createdAt > 0
      ? value.createdAt
      : 0
  return { date: value.date, time, note, createdAt }
}

function sortedRecords(map) {
  return [...map.values()].sort((left, right) => (left.date < right.date ? -1 : left.date > right.date ? 1 : 0))
}

// ---------------------------------------------------------------------------
// record store
// ---------------------------------------------------------------------------

function resolveDataFile(config) {
  if (isRecord(config) && typeof config.dataFile === 'string' && config.dataFile !== '') {
    return config.dataFile
  }
  const home =
    typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME !== ''
      ? process.env.DSH_HOME
      : join(homedir(), '.dsh')
  return join(home, 'early-sleep', 'records.json')
}

function createStore(dataFile) {
  /** @type {Map<string, {date:string,time:string,note:string,createdAt:number}>} */
  const records = new Map()
  let queue = Promise.resolve()

  function load() {
    let text
    try {
      text = readFileSync(dataFile, 'utf8')
    } catch {
      return // a missing or unreadable file starts an empty store
    }
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      return // a corrupt file is ignored rather than crashing the Host
    }
    const list = isRecord(parsed) && Array.isArray(parsed.records) ? parsed.records : []
    for (const item of list) {
      const record = normalizeStoredRecord(item)
      if (record !== null) records.set(record.date, record)
    }
  }

  function persist() {
    mkdirSync(dirname(dataFile), { recursive: true })
    const tmpFile = `${dataFile}.${process.pid}.${Date.now()}.tmp`
    writeFileSync(tmpFile, JSON.stringify({ version: 1, records: sortedRecords(records) }, null, 2), 'utf8')
    renameSync(tmpFile, dataFile)
  }

  /** Serialize every mutation; reads of the in-memory map are always consistent. */
  function mutate(operation) {
    const run = queue.then(operation)
    queue = run.then(
      () => undefined,
      () => undefined,
    )
    return run
  }

  load()

  return {
    dataFile,
    list() {
      return sortedRecords(records)
    },
    async upsert(input) {
      return mutate(async () => {
        if (records.size >= MAX_RECORDS && !records.has(input.date)) {
          throw Object.assign(new Error('record limit reached'), { code: 'early-sleep/limit' })
        }
        const existing = records.get(input.date)
        const record = {
          date: input.date,
          time: input.time,
          note: input.note,
          createdAt: existing ? existing.createdAt : Date.now(),
        }
        records.set(record.date, record)
        persist()
        return { record, records: sortedRecords(records) }
      })
    },
    async remove(date) {
      return mutate(async () => {
        const removed = records.delete(date)
        if (removed) persist()
        return { removed, records: sortedRecords(records) }
      })
    },
  }
}

// ---------------------------------------------------------------------------
// HTTP route
// ---------------------------------------------------------------------------

function json(body) {
  return Response.json(body, { headers: { 'cache-control': 'no-store' } })
}

function failure(code, message) {
  return json({ ok: false, error: { code, message }, generatedAt: Date.now() })
}

async function readBody(request) {
  try {
    const body = await request.json()
    return isRecord(body) ? body : null
  } catch {
    return null
  }
}

function createFetchHandler(store) {
  return async function handleRecordsRequest(request) {
    try {
      const method = typeof request?.method === 'string' ? request.method.toUpperCase() : 'GET'
      let params = null
      try {
        params = new URL(request?.url ?? '', 'http://localhost').searchParams
      } catch {
        params = null
      }

      if (method === 'GET') {
        return json({ ok: true, generatedAt: Date.now(), dataFile: store.dataFile, records: store.list() })
      }

      if (method === 'POST') {
        const body = await readBody(request)
        if (body === null) return failure('early-sleep/bad-request', 'Expected a JSON object body.')
        if (!isValidDate(body.date)) {
          return failure('early-sleep/bad-date', 'Field "date" must be a real calendar date in YYYY-MM-DD form.')
        }
        const time = normalizeTime(body.time)
        if (time === null) {
          return failure('early-sleep/bad-time', 'Field "time" must use the 24-hour HH:MM form.')
        }
        const note = normalizeNote(body.note)
        if (note === null) {
          return failure('early-sleep/bad-note', 'Field "note" must be a string.')
        }
        const result = await store.upsert({ date: body.date, time, note })
        return json({ ok: true, generatedAt: Date.now(), saved: result.record, records: result.records })
      }

      if (method === 'DELETE') {
        let date = params?.get('date') ?? ''
        if (date === '') {
          const body = await readBody(request)
          if (body !== null && typeof body.date === 'string') date = body.date
        }
        if (!isValidDate(date)) {
          return failure('early-sleep/bad-date', 'A "date" in YYYY-MM-DD form is required.')
        }
        const result = await store.remove(date)
        return json({ ok: true, generatedAt: Date.now(), removed: result.removed, records: result.records })
      }

      return failure('early-sleep/method', `Unsupported method ${method}.`)
    } catch (error) {
      return failure(
        error && typeof error.code === 'string' ? error.code : 'early-sleep/internal',
        errorMessage(error),
      )
    }
  }
}

// ---------------------------------------------------------------------------
// plugin entry
// ---------------------------------------------------------------------------

export function apply(ctx, config = {}) {
  let store
  try {
    store = createStore(resolveDataFile(config))
  } catch (error) {
    ctx.logger?.warn?.(`early-sleep: failed to initialise store: ${errorMessage(error)}`)
    return
  }

  try {
    ctx.inject(['connection'], (scope) => {
      const connection = scope.get('connection')
      const register =
        typeof connection?.fetch?.register === 'function' ? connection.fetch.register.bind(connection.fetch) : null
      if (register === null) {
        ctx.logger?.warn?.('early-sleep: connection.fetch.register is unavailable; records route not registered')
        return
      }
      scope.effect(
        () =>
          register({
            path: ROUTE_PATH,
            methods: ['GET', 'POST', 'DELETE'],
            requestBody: 'buffered',
            fetch: createFetchHandler(store),
          }),
        'early-sleep: records route',
      )
    })
  } catch (error) {
    ctx.logger?.warn?.(`early-sleep: failed to register records route: ${errorMessage(error)}`)
  }
}

// Test-only surface; the loader only consumes `apply`.
export const __test = {
  ROUTE_PATH,
  DATE_RE,
  TIME_RE,
  isValidDate,
  normalizeTime,
  normalizeNote,
  resolveDataFile,
  createStore,
  createFetchHandler,
}
