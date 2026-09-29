// Browser-only preview data (npm run dev). Never loaded inside FiveM.
import type {
  CategoryConfig,
  InventoryItem,
  InventoryItemInfo,
  Message,
  PlayerData,
  PlayerHistory,
  PriorityConfig,
  Report,
  ReportNote,
  Statistics,
  StatsRange
} from "@/types"

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()

export const ME: PlayerData = {
  identifier: "license:4f1c2a9b7e0d",
  name: "Nova Reyes",
  isAdmin: true,
  group: "admin",
  permissions: Object.fromEntries(
    [
      "view_reports", "claim_report", "resolve_report", "delete_report", "set_priority",
      "send_admin_message", "view_notes", "manage_notes", "teleport_to", "bring_player",
      "heal_player", "revive_player", "freeze_player", "spectate_player", "screenshot_player",
      "ragdoll_player", "kick_player", "manage_inventory", "view_statistics", "view_player_history"
    ].map((permission) => [permission, true])
  )
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "general", label: "General", icon: "fa-circle-info" },
  { id: "bug", label: "Bug Report", icon: "fa-bug" },
  { id: "player", label: "Player Report", icon: "fa-user" },
  { id: "question", label: "Question", icon: "fa-question" },
  { id: "other", label: "Other", icon: "fa-ellipsis" }
]

export const PRIORITIES: PriorityConfig[] = [
  { id: 0, label: "Low", color: "gray" },
  { id: 1, label: "Normal", color: "blue" },
  { id: 2, label: "High", color: "orange" },
  { id: 3, label: "Urgent", color: "red" }
]

// Fake screenshot: dusk sky over a street, enough to judge image handling
const SCREENSHOT = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3a67"/><stop offset=".6" stop-color="#d9825b"/><stop offset="1" stop-color="#3a2a2f"/></linearGradient></defs>
    <rect width="640" height="360" fill="url(#s)"/>
    <path d="M0 250 L60 180 L60 250 L120 150 L120 250 L190 200 L190 250 L260 120 L260 250 L330 190 L330 250 L400 140 L400 250 L470 210 L470 250 L540 160 L540 250 L640 200 L640 360 L0 360Z" fill="#1d1b26"/>
    <rect y="290" width="640" height="70" fill="#2a2830"/><rect x="40" y="318" width="80" height="6" fill="#e8c85a"/><rect x="200" y="318" width="80" height="6" fill="#e8c85a"/><rect x="360" y="318" width="80" height="6" fill="#e8c85a"/>
  </svg>`
)

const msg = (
  id: number,
  reportId: number,
  senderType: Message["senderType"],
  senderName: string,
  message: string,
  minutes: number,
  extra: Partial<Message> = {}
): Message => ({
  id,
  reportId,
  senderId: senderType === "system" ? "system" : `license:${senderName.toLowerCase().replace(/\W/g, "")}`,
  senderName,
  senderType,
  message,
  createdAt: minutesAgo(minutes),
  ...extra
})

const report = (data: Partial<Report> & Pick<Report, "id" | "subject" | "playerName">, minutes: number): Report => ({
  playerId: `license:${data.playerName.toLowerCase().replace(/\W/g, "")}`,
  category: "general",
  status: "open",
  priority: 1,
  createdAt: minutesAgo(minutes),
  updatedAt: minutesAgo(Math.max(0, minutes - 3)),
  messages: [],
  isPlayerOnline: true,
  ...data
})

export const MY_REPORTS: Report[] = [
  report({
    id: 151,
    playerId: ME.identifier,
    playerName: ME.name,
    subject: "Fahrzeugschlüssel nach Restart weg",
    category: "bug",
    priority: 1,
    description: "Mein Sultan RS steht in der Garage am Würfelpark, aber ich habe seit dem Restart um 18 Uhr keinen Schlüssel mehr.\nKennzeichen: 82LQK417",
    messages: [
      msg(901, 151, "player", ME.name, "Kann mir da jemand helfen? Brauche das Auto heute noch für einen Einsatz.", 12)
    ]
  }, 14),
  report({
    id: 149,
    playerId: ME.identifier,
    playerName: ME.name,
    subject: "Frage zur Fraktionsbewerbung",
    category: "question",
    status: "claimed",
    priority: 0,
    claimedBy: "license:lenavogt",
    claimedByName: "Lena Vogt",
    messages: [
      msg(880, 149, "player", ME.name, "Wo finde ich das Formular für die LSMD-Bewerbung?", 95),
      msg(881, 149, "admin", "Lena Vogt", "Im Discord unter #bewerbungen, angepinnte Nachricht. Melde dich, falls der Link nicht geht.", 80)
    ]
  }, 98)
]

export const ALL_REPORTS: Report[] = [
  report({
    id: 152,
    playerName: "Marcus Hale",
    subject: "RDM at Legion Square, third time today",
    category: "player",
    priority: 3,
    description: "Player \"xXDarkKillerXx\" (ID 214) shot me without any RP at Legion Square while I was talking to a friend. Third time today, clip is on my Twitch.",
    messages: [
      msg(950, 152, "player", "Marcus Hale", "He's still around the square, you can catch him there", 3),
      msg(951, 152, "system", "System", "Automatic screenshot on report creation", 4, { imageUrl: SCREENSHOT })
    ]
  }, 4),
  report({
    id: 151,
    playerId: ME.identifier,
    playerName: ME.name,
    subject: "Fahrzeugschlüssel nach Restart weg",
    category: "bug",
    priority: 1,
    description: "Mein Sultan RS steht in der Garage am Würfelpark, aber ich habe seit dem Restart um 18 Uhr keinen Schlüssel mehr.\nKennzeichen: 82LQK417",
    messages: []
  }, 14),
  report({
    id: 150,
    playerName: "Jamal Ortiz",
    subject: "Car vanished from Pillbox garage after tsunami",
    category: "bug",
    status: "claimed",
    priority: 2,
    claimedBy: ME.identifier,
    claimedByName: ME.name,
    description: "Parked my Elegy at Pillbox before the restart. Garage says it's out, but it's nowhere on the map and impound is empty.",
    messages: [
      msg(930, 150, "player", "Jamal Ortiz", "Garage says vehicle is out but it's not anywhere", 22),
      msg(931, 150, "system", "System", "Nova Reyes claimed this report", 20),
      msg(932, 150, "admin", ME.name, "Checking the garage logs, give me a minute.", 19),
      msg(933, 150, "player", "Jamal Ortiz", "Thanks! Plate is 4JX 912", 18),
      msg(934, 150, "admin", ME.name, "Found it, the vehicle got stuck in a despawn state. Resetting it now, it will be back in Pillbox in about 30 seconds.", 9),
      msg(935, 150, "player", "Jamal Ortiz", "", 8, { messageType: "voice", audioUrl: "mock:voice", audioDuration: 7 }),
      msg(936, 150, "system", "System", "Nova Reyes teleported to the player", 6)
    ]
  }, 23),
  report({
    id: 148,
    playerName: "Elif Şahin",
    subject: "How do I apply for LSPD?",
    category: "question",
    priority: 0,
    isPlayerOnline: false,
    description: "Wanted to join the police department, where can I find the application?"
  }, 41),
  report({
    id: 147,
    playerName: "Tom Weber",
    subject: "Stuck under the map near Sandy Shores airfield",
    category: "bug",
    status: "claimed",
    priority: 3,
    claimedBy: "license:jayr",
    claimedByName: "Jay R.",
    messages: [
      msg(910, 147, "player", "Tom Weber", "fell through the ground next to the hangar, can't move", 64),
      msg(911, 147, "system", "System", "Jay R. claimed this report", 60)
    ]
  }, 66),
  report({
    id: 146,
    playerName: "Kira Novak",
    subject: "Combat logging during the Fleeca robbery",
    category: "player",
    priority: 2,
    description: "Suspect disconnected right when we cuffed him at Fleeca on Route 68. Name was Danny Rook."
  }, 128),
  report({
    id: 145,
    playerName: "Danny Rook",
    subject: "Lost 25,000$ after game crash",
    category: "bug",
    priority: 1,
    isPlayerOnline: false
  }, 190),
  report({
    id: 144,
    playerName: "Sofia Marchetti",
    subject: "Fail RP at the Diamond Casino entrance",
    category: "player",
    status: "claimed",
    priority: 1,
    claimedBy: "license:lenavogt",
    claimedByName: "Lena Vogt"
  }, 305),
  report({
    id: 143,
    playerName: "Ben Okafor",
    subject: "Phone app crashes when opening bank",
    category: "bug",
    priority: 0
  }, 1500)
]

export const ARCHIVE: Report[] = [
  report({ id: 139, playerName: "Mia Lindqvist", subject: "Housing door won't lock", category: "bug", status: "resolved", priority: 1, claimedBy: "license:jayr", claimedByName: "Jay R.", resolvedAt: minutesAgo(400), isPlayerOnline: false }, 520),
  report({ id: 137, playerName: "Carlos Mendez", subject: "Harassment in OOC chat", category: "player", status: "resolved", priority: 2, claimedBy: ME.identifier, claimedByName: ME.name, resolvedAt: minutesAgo(900) }, 960),
  report({ id: 134, playerName: "Hannah Becker", subject: "Wie funktioniert das Tankstellen-Minigame?", category: "question", status: "resolved", priority: 0, claimedBy: "license:lenavogt", claimedByName: "Lena Vogt", resolvedAt: minutesAgo(2000), isPlayerOnline: false }, 2100)
]

export const REPORT_NOTES: Record<number, ReportNote[]> = {
  150: [
    { id: 71, reportId: 150, adminId: ME.identifier, adminName: ME.name, note: "Garage row 3 had state=out with no entity. Reset via txAdmin, keep an eye on it after the next restart.", createdAt: minutesAgo(7) },
    { id: 70, reportId: 150, adminId: "license:jayr", adminName: "Jay R.", note: "Same plate came up in #128 last week.", createdAt: minutesAgo(15) }
  ],
  152: [
    { id: 72, reportId: 152, adminId: "license:lenavogt", adminName: "Lena Vogt", note: "xXDarkKillerXx already has two warnings for RDM this month.", createdAt: minutesAgo(2) }
  ]
}

export const playerHistory = (playerId: string, playerName: string): PlayerHistory => ({
  playerId,
  playerName,
  totalReports: 6,
  openReports: 1,
  resolvedReports: 5,
  identifiers: {
    license: playerId,
    steam: "steam:11000013a8f4c21",
    discord: "discord:381924011592302593",
    fivem: "fivem:1942087"
  },
  reports: [...ALL_REPORTS, ...ARCHIVE].filter((r) => r.playerId === playerId).concat(ARCHIVE.slice(0, 2)).map((r) => ({
    id: r.id,
    playerId,
    playerName,
    subject: r.subject,
    category: r.category,
    status: r.status,
    priority: r.priority,
    claimedByName: r.claimedByName,
    createdAt: r.createdAt,
    resolvedAt: r.resolvedAt
  })),
  notes: [
    { id: 12, playerId, adminId: "license:lenavogt", adminName: "Lena Vogt", note: "Friendly, reports are usually accurate.", createdAt: minutesAgo(4300) }
  ]
})

export const ITEM_LIST: Record<string, InventoryItemInfo> = Object.fromEntries(
  [
    ["water", "Water"], ["burger", "Burger"], ["phone", "Phone"], ["lockpick", "Lockpick"],
    ["bandage", "Bandage"], ["radio", "Radio"], ["money", "Cash"], ["weapon_pistol", "Pistol"],
    ["repairkit", "Repair Kit"], ["id_card", "ID Card"], ["armour", "Body Armour"]
  ].map(([name, label]) => [name, { name, label, weight: 100 }])
)

export const INVENTORY: InventoryItem[] = [
  { name: "money", label: "Cash", count: 2450, slot: 1 },
  { name: "phone", label: "Phone", count: 1, slot: 2, metadata: { number: "555-0182" } },
  { name: "water", label: "Water", count: 3, slot: 3 },
  { name: "burger", label: "Burger", count: 2, slot: 4 },
  { name: "id_card", label: "ID Card", count: 1, slot: 5, metadata: { name: "Jamal Ortiz", dob: "1994-03-11" } },
  { name: "lockpick", label: "Lockpick", count: 4, slot: 6 },
  { name: "bandage", label: "Bandage", count: 6, slot: 7 },
  { name: "radio", label: "Radio", count: 1, slot: 8 }
]

// Deterministic noise so screenshots stay comparable between runs
const seeded = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

// Evening-heavy RP server: few reports at night, peak around 21:00
const HOURLY_WEIGHT = [3, 2, 1.2, 0.8, 0.5, 0.4, 0.4, 0.6, 0.9, 1.2, 1.5, 1.8, 2.2, 2.5, 2.8, 3.2, 3.8, 4.5, 5.4, 6.4, 7.2, 7.6, 6.6, 4.8]

const pad = (value: number) => String(value).padStart(2, "0")
const dayLabel = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const percentile = (values: number[], p: number) => {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)]
}

const summary = (values: number[]) => ({ median: percentile(values, 0.5), p90: percentile(values, 0.9), count: values.length })

export const generateStatistics = (range: StatsRange): Statistics => {
  const random = seeded(range.length * 7919 + 17)
  const now = new Date()
  const days = { today: 1, "7d": 7, "30d": 30, "90d": 90, all: 240 }[range]
  const bucket = range === "today" ? "hour" : range === "all" ? "week" : "day"

  // Durations drawn from a long-tailed distribution like real support work
  const firstResponse = () => 40 + Math.pow(random(), 2.4) * 2400
  const resolution = () => 300 + Math.pow(random(), 2.2) * 21600

  const buildPeriod = (scale: number) => {
    const created = Math.round(38 * days * scale * (range === "today" ? now.getHours() / 24 + 0.1 : 1))
    const firstValues = Array.from({ length: Math.round(created * 0.82) }, () => firstResponse() * (scale > 1 ? 1.15 : 1))
    const resolutionValues = Array.from({ length: Math.round(created * 0.93) }, () => resolution() * (scale > 1 ? 1.1 : 1))
    return {
      from: Math.floor(Date.now() / 1000) - (range === "today" ? now.getHours() * 3600 : days * 86400),
      to: Math.floor(Date.now() / 1000),
      created,
      resolved: resolutionValues.length,
      firstResponse: summary(firstValues),
      resolution: summary(resolutionValues)
    }
  }

  const series = []
  let backlog = 11
  const points = range === "today" ? now.getHours() + 1 : bucket === "week" ? Math.ceil(days / 7) : days
  for (let i = points - 1; i >= 0; i--) {
    const date = new Date(now)
    let created: number
    if (range === "today") {
      date.setHours(now.getHours() - i, 0, 0, 0)
      created = Math.round(HOURLY_WEIGHT[date.getHours()] * (0.7 + random() * 0.6))
    } else {
      date.setDate(now.getDate() - i * (bucket === "week" ? 7 : 1))
      const weekend = date.getDay() === 0 || date.getDay() === 6 ? 1.35 : 1
      created = Math.round(38 * weekend * (0.75 + random() * 0.5) * (bucket === "week" ? 7 : 1))
    }
    const resolved = Math.max(0, Math.round(created * (range === "today" ? 0.55 + random() * 0.7 : 0.85 + random() * 0.25)))
    backlog = Math.max(0, backlog + created - resolved)
    series.push({
      date: range === "today" ? `${dayLabel(date)} ${pad(date.getHours())}:00` : dayLabel(date),
      created,
      resolved,
      backlog,
      firstResponseMedian: created ? 120 + random() * 360 : null,
      resolutionMedian: resolved ? 1200 + random() * 2400 : null
    })
  }

  const current = buildPeriod(1)

  return {
    range,
    bucket,
    generatedAt: Math.floor(Date.now() / 1000),
    snapshot: { open: 6, claimed: 3, oldestOpenAt: Math.floor(Date.now() / 1000) - 1500 * 60 },
    current,
    previous: range === "all" ? null : buildPeriod(1.12),
    series,
    hours: HOURLY_WEIGHT.map((weight, hour) => ({
      hour,
      created: Math.round(weight * days * 1.6),
      // Slow replies at night and at peak, when few staff are around per report
      firstResponseMedian: 150 + (hour < 7 ? 900 : 0) + (weight > 6 ? 420 : 0) + random() * 120
    })),
    categories: [
      { category: "player", count: Math.round(current.created * 0.4) },
      { category: "bug", count: Math.round(current.created * 0.31) },
      { category: "question", count: Math.round(current.created * 0.18) },
      { category: "general", count: Math.round(current.created * 0.08) },
      { category: "other", count: Math.round(current.created * 0.03) }
    ],
    priorities: [
      { priority: 3, count: Math.round(current.created * 0.05), resolutionMedian: 780 },
      { priority: 2, count: Math.round(current.created * 0.16), resolutionMedian: 1500 },
      { priority: 1, count: Math.round(current.created * 0.47), resolutionMedian: 2280 },
      { priority: 0, count: Math.round(current.created * 0.32), resolutionMedian: 3900 }
    ],
    resolutions: Array.from({ length: Math.min(600, current.resolved) }, () => {
      const priority = random() < 0.05 ? 3 : random() < 0.2 ? 2 : random() < 0.6 ? 1 : 0
      return {
        createdAt: Math.floor(Date.now() / 1000 - random() * days * 86400 * (range === "today" ? now.getHours() / 24 : 1)),
        seconds: resolution() * (priority === 3 ? 0.4 : priority === 2 ? 0.7 : 1),
        priority
      }
    }),
    staff: [
      { adminId: "license:lenavogt", adminName: "Lena Vogt", handled: 0.29, resolved: 0.3, messages: 4.1, fr: 170, res: 1320 },
      { adminId: ME.identifier, adminName: ME.name, handled: 0.26, resolved: 0.27, messages: 3.4, fr: 220, res: 1680 },
      { adminId: "license:jayr", adminName: "Jay R.", handled: 0.19, resolved: 0.18, messages: 2.2, fr: 340, res: 2460 },
      { adminId: "license:mo", adminName: "Mo Al-Rashid", handled: 0.15, resolved: 0.15, messages: 1.8, fr: 260, res: 1980 },
      { adminId: "license:pia", adminName: "Pia Krüger", handled: 0.08, resolved: 0.07, messages: 0.9, fr: 610, res: 3240 }
    ].map(({ fr, res, handled, resolved, messages, ...person }) => ({
      ...person,
      handled: Math.round(current.created * handled),
      resolved: Math.round(current.resolved * resolved),
      messages: Math.round(current.created * messages * 0.6),
      firstResponseMedian: fr,
      resolutionMedian: res
    }))
  }
}

// 3 seconds of a quiet tone, so the voice player has something to load
export const createVoiceSample = (): string => {
  const rate = 8000
  const seconds = 3
  const samples = rate * seconds
  const buffer = new ArrayBuffer(44 + samples * 2)
  const view = new DataView(buffer)
  const write = (offset: number, text: string) => [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))

  write(0, "RIFF")
  view.setUint32(4, 36 + samples * 2, true)
  write(8, "WAVE")
  write(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, rate, true)
  view.setUint32(28, rate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  write(36, "data")
  view.setUint32(40, samples * 2, true)
  for (let i = 0; i < samples; i++) {
    view.setInt16(44 + i * 2, Math.sin((i / rate) * 2 * Math.PI * 220) * 1200, true)
  }

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }))
}
