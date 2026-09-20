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
  Statistics
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

const day = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

export const STATISTICS: Statistics = {
  totalReports: 1284,
  openReports: 9,
  claimedReports: 4,
  resolvedReports: 1271,
  avgResolutionTime: 38,
  reportsByCategory: [
    { category: "player", count: 512 },
    { category: "bug", count: 401 },
    { category: "question", count: 238 },
    { category: "general", count: 97 },
    { category: "other", count: 36 }
  ],
  reportsByPriority: [
    { priority: 0, count: 402 },
    { priority: 1, count: 611 },
    { priority: 2, count: 203 },
    { priority: 3, count: 68 }
  ],
  adminLeaderboard: [
    { adminId: "license:lenavogt", adminName: "Lena Vogt", claimed: 402, resolved: 391, messages: 1880 },
    { adminId: ME.identifier, adminName: ME.name, claimed: 377, resolved: 362, messages: 1502 },
    { adminId: "license:jayr", adminName: "Jay R.", claimed: 251, resolved: 240, messages: 930 },
    { adminId: "license:mo", adminName: "Mo Al-Rashid", claimed: 160, resolved: 158, messages: 611 },
    { adminId: "license:pia", adminName: "Pia Krüger", claimed: 94, resolved: 90, messages: 342 }
  ],
  recentActivity: [6, 5, 4, 3, 2, 1, 0].map((offset, i) => ({ date: day(offset), count: [21, 34, 18, 27, 41, 30, 12][i] }))
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
