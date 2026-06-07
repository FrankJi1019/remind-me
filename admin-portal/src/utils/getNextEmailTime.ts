const SEND_HOUR = 7

export function getNextEmailTime(): string {
  const now = new Date()
  const nzdt = new Date(
    now.toLocaleString("en-US", { timeZone: "Pacific/Auckland" })
  )

  const next = new Date(nzdt)
  next.setHours(SEND_HOUR, 0, 0, 0)

  if (nzdt >= next) {
    next.setDate(next.getDate() + 1)
  }

  const year = next.getFullYear()
  const month = String(next.getMonth() + 1).padStart(2, "0")
  const day = String(next.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}T07:00:00+13:00`
}
