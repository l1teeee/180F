import { describe, expect, it } from "vitest"

import { escapeIcsText, foldIcsLine } from "@/lib/ics"

describe("escapeIcsText", () => {
  it("leaves plain text unchanged", () => {
    expect(escapeIcsText("180 Fitness Studio")).toBe("180 Fitness Studio")
  })

  it("escapes comma, semicolon and backslash", () => {
    expect(escapeIcsText("a,b;c\\d")).toBe("a\\,b\\;c\\\\d")
  })

  it("converts CRLF to the two-character \\n", () => {
    expect(escapeIcsText("line1\r\nline2")).toBe("line1\\nline2")
  })

  it("converts a lone CR to the two-character \\n", () => {
    expect(escapeIcsText("line1\rline2")).toBe("line1\\nline2")
  })

  it("converts a lone LF to the two-character \\n", () => {
    expect(escapeIcsText("line1\nline2")).toBe("line1\\nline2")
  })

  it("neutralizes a hostile value attempting property injection", () => {
    const hostile = "Street 1\r\nBEGIN:VEVENT\r\nSUMMARY:x"
    const escaped = escapeIcsText(hostile)
    expect(escaped).not.toContain("\r")
    expect(escaped).not.toContain("\n")
    expect(escaped).toBe("Street 1\\nBEGIN:VEVENT\\nSUMMARY:x")
  })

  it("produces a valid escaped LOCATION for the seeded address", () => {
    const address = "Carrera 11 # 93-45, Bogota"
    expect(escapeIcsText(address)).toBe("Carrera 11 # 93-45\\, Bogota")
  })
})

describe("foldIcsLine", () => {
  it("leaves short lines unchanged", () => {
    const line = "SUMMARY:Short class name"
    expect(foldIcsLine(line)).toBe(line)
  })

  it("folds lines longer than 75 octets with CRLF + leading space", () => {
    const line = `LOCATION:${"a".repeat(100)}`
    const folded = foldIcsLine(line)
    const physicalLines = folded.split("\r\n")
    expect(physicalLines.length).toBeGreaterThan(1)
    for (const physicalLine of physicalLines.slice(1)) {
      expect(physicalLine.startsWith(" ")).toBe(true)
    }
    for (const physicalLine of physicalLines) {
      expect(new TextEncoder().encode(physicalLine).byteLength).toBeLessThanOrEqual(75)
    }
    // Unfolding (strip CRLF + following space) must reconstruct the original line.
    expect(folded.replaceAll("\r\n ", "")).toBe(line)
  })
})
