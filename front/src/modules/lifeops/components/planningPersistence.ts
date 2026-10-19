// All writes and transitions share one queue, including retries after failures.
export function serialQueue() {
  let tail: Promise<unknown> = Promise.resolve()
  return function run<T>(action: () => Promise<T>): Promise<T> {
    const result = tail.then(action)
    tail = result.catch(() => undefined)
    return result
  }
}

export async function persistLatest<T>(read: () => T, saved: () => string, write: (value: T) => Promise<T>, acknowledge: (snapshot: string, response?: T) => void) {
  while (JSON.stringify(read()) !== saved()) {
    const snapshot = JSON.stringify(read())
    const response = await write(JSON.parse(snapshot) as T)
    // Never replace edits made while a request was in flight with its old response.
    acknowledge(snapshot, JSON.stringify(read()) === snapshot ? response : undefined)
  }
}
