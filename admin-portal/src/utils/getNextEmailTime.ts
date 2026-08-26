export function getNextEmailTime(hour = 7, minute = 0): string {
  const now = new Date()
  const nzdt = new Date(
    now.toLocaleString("en-US", { timeZone: "Pacific/Auckland" })
  )

  const next = new Date(nzdt)
  next.setHours(hour, minute, 0, 0)

  if (nzdt >= next) {
    next.setDate(next.getDate() + 1)
  }

  const year = next.getFullYear()
  const month = String(next.getMonth() + 1).padStart(2, "0")
  const day = String(next.getDate()).padStart(2, "0")
  const hh = String(hour).padStart(2, "0")
  const mm = String(minute).padStart(2, "0")

  return `${year}-${month}-${day}T${hh}:${mm}:00`
}
