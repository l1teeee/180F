// RFC 5545 section 3.3.11 TEXT escaping and section 3.1 line folding, used when building the
// booking confirmation .ics file. Values like the studio address and class name are editable
// by the administrator (Settings, class editing) and must never let CR/LF splice a new
// property or component into the calendar file.

// Order matters: backslash must be escaped first, or the backslashes this function inserts
// for ;/,/\n would themselves get re-escaped.
export function escapeIcsText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\r\n", "\\n")
    .replaceAll("\r", "\\n")
    .replaceAll("\n", "\\n")
}

// RFC 5545 section 3.1: each physical line (continuation lines included, leading space counted)
// must not exceed 75 octets. TextEncoder gives UTF-8 byte length so folding is correct for
// non-ASCII content too.
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder()
  if (encoder.encode(line).byteLength <= 75) return line

  const chunks: string[] = []
  let current = ""
  let limit = 75
  for (const char of line) {
    const candidate = current + char
    if (encoder.encode(candidate).byteLength > limit) {
      chunks.push(current)
      current = char
      limit = 74 // continuation lines reserve one octet for the leading fold space
    } else {
      current = candidate
    }
  }
  if (current) chunks.push(current)

  return chunks
    .map((chunk, index) => (index === 0 ? chunk : ` ${chunk}`))
    .join("\r\n")
}
