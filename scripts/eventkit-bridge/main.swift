#!/usr/bin/env swift
// ── EventKit Bridge ───────────────────────────────────────────────────────────
// CLI tool that reads macOS EventKit and outputs JSON to stdout.
// Compile with: swiftc main.swift -o eventkit-bridge
//
// Usage:
//   eventkit-bridge calendars
//   eventkit-bridge events --start 2026-05-01 --end 2026-05-31 [--calendar-ids id1,id2]
//   eventkit-bridge reminder-lists
//   eventkit-bridge reminders [--list-ids id1,id2] [--completed true|false|both]
//   eventkit-bridge complete --id <reminder-id>

import EventKit
import Foundation

// ── JSON output helpers ───────────────────────────────────────────────────────

func output(_ value: Any) {
  let data = try! JSONSerialization.data(withJSONObject: value, options: [.sortedKeys])
  print(String(data: data, encoding: .utf8)!)
}

func fail(_ message: String) -> Never {
  let data = try! JSONSerialization.data(withJSONObject: ["error": message])
  fputs(String(data: data, encoding: .utf8)! + "\n", stderr)
  exit(1)
}

// ── Date helpers ──────────────────────────────────────────────────────────────

let iso8601Full: DateFormatter = {
  let f = DateFormatter()
  f.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
  f.locale = Locale(identifier: "en_US_POSIX")
  return f
}()

let iso8601Date: DateFormatter = {
  let f = DateFormatter()
  f.dateFormat = "yyyy-MM-dd"
  f.locale = Locale(identifier: "en_US_POSIX")
  return f
}()

func toISO(_ date: Date, dateOnly: Bool = false) -> String {
  dateOnly ? iso8601Date.string(from: date) : iso8601Full.string(from: date)
}

func parseDate(_ s: String) -> Date? {
  iso8601Full.date(from: s) ?? iso8601Date.date(from: s)
}

// ── Color helper ──────────────────────────────────────────────────────────────

#if canImport(AppKit)
import AppKit
func hexColor(_ color: NSColor?) -> String {
  guard let c = color?.usingColorSpace(.sRGB) else { return "#888888" }
  return String(format: "#%02X%02X%02X",
    Int(c.redComponent * 255),
    Int(c.greenComponent * 255),
    Int(c.blueComponent * 255))
}
#endif

// ── Permission request ────────────────────────────────────────────────────────

func requestAccess(store: EKEventStore, entity: EKEntityType) {
  let sema = DispatchSemaphore(value: 0)
  var granted = false
  store.requestFullAccessToEvents { ok, _ in granted = ok; sema.signal() }
  if entity == .reminder {
    store.requestFullAccessToReminders { ok, _ in granted = ok; sema.signal() }
  }
  sema.wait()
  if !granted { fail("EventKit access denied for \(entity == .event ? "Calendar" : "Reminders"). Grant access in System Settings → Privacy → \(entity == .event ? "Calendars" : "Reminders").") }
}

// ── Main ──────────────────────────────────────────────────────────────────────

let args = CommandLine.arguments.dropFirst()  // drop binary name
guard let command = args.first else { fail("Usage: eventkit-bridge <command> [args]") }

let store = EKEventStore()

// Parse named args
var named: [String: String] = [:]
var i = args.dropFirst().startIndex
let restArgs = Array(args.dropFirst())
var j = 0
while j < restArgs.count {
  let arg = restArgs[j]
  if arg.hasPrefix("--"), j + 1 < restArgs.count {
    named[String(arg.dropFirst(2))] = restArgs[j + 1]
    j += 2
  } else {
    j += 1
  }
}

switch command {

// ── calendars ─────────────────────────────────────────────────────────────────
case "calendars":
  requestAccess(store: store, entity: .event)
  let cals = store.calendars(for: .event).map { cal -> [String: Any] in
    [
      "id":    cal.calendarIdentifier,
      "name":  cal.title,
      "color": hexColor(cal.cgColor.flatMap { NSColor(cgColor: $0) }),
      "type":  { switch cal.type {
        case .local:        return "local"
        case .calDAV:       return "calDAV"
        case .exchange:     return "exchange"
        case .subscription: return "subscription"
        case .birthday:     return "birthday"
        @unknown default:   return "local"
      }}(),
    ]
  }
  output(["calendars": cals])

// ── events ────────────────────────────────────────────────────────────────────
case "events":
  guard let startStr = named["start"], let endStr = named["end"] else {
    fail("events requires --start and --end")
  }
  guard let startDate = parseDate(startStr), let endDate = parseDate(endStr) else {
    fail("Invalid date format. Use YYYY-MM-DD or ISO 8601.")
  }
  requestAccess(store: store, entity: .event)

  var calendars: [EKCalendar]? = nil
  if let ids = named["calendar-ids"] {
    let idSet = Set(ids.split(separator: ",").map(String.init))
    calendars = store.calendars(for: .event).filter { idSet.contains($0.calendarIdentifier) }
  }

  let predicate = store.predicateForEvents(withStart: startDate, end: endDate, calendars: calendars)
  let events = store.events(matching: predicate)
    .sorted { $0.startDate < $1.startDate }
    .map { ev -> [String: Any] in
      var dict: [String: Any] = [
        "id":            ev.calendarItemIdentifier,
        "title":         ev.title ?? "(no title)",
        "startDate":     toISO(ev.startDate, dateOnly: ev.isAllDay),
        "endDate":       toISO(ev.endDate ?? ev.startDate, dateOnly: ev.isAllDay),
        "isAllDay":      ev.isAllDay,
        "calendarId":    ev.calendar.calendarIdentifier,
        "calendarName":  ev.calendar.title,
        "calendarColor": hexColor(ev.calendar.cgColor.flatMap { NSColor(cgColor: $0) }),
        "isRecurring":   ev.hasRecurrenceRules,
      ]
      if let loc = ev.location { dict["location"] = loc }
      if let notes = ev.notes { dict["notes"] = notes }
      if let url = ev.url { dict["url"] = url.absoluteString }
      return dict
    }
  output(["events": events])

// ── reminder-lists ────────────────────────────────────────────────────────────
case "reminder-lists":
  requestAccess(store: store, entity: .reminder)
  let lists = store.calendars(for: .reminder).map { cal -> [String: Any] in
    [
      "id":    cal.calendarIdentifier,
      "name":  cal.title,
      "color": hexColor(cal.cgColor.flatMap { NSColor(cgColor: $0) }),
    ]
  }
  output(["lists": lists])

// ── reminders ────────────────────────────────────────────────────────────────
case "reminders":
  requestAccess(store: store, entity: .reminder)

  let completedStr = named["completed"] ?? "false"
  let fetchComplete: Bool? = completedStr == "both" ? nil : (completedStr == "true")

  var lists: [EKCalendar]? = nil
  if let ids = named["list-ids"] {
    let idSet = Set(ids.split(separator: ",").map(String.init))
    lists = store.calendars(for: .reminder).filter { idSet.contains($0.calendarIdentifier) }
  }

  let predicate = store.predicateForReminders(in: lists)
  let sema = DispatchSemaphore(value: 0)
  var fetchedReminders: [EKReminder] = []

  store.fetchReminders(matching: predicate) { result in
    fetchedReminders = result ?? []
    sema.signal()
  }
  sema.wait()

  let filtered = fetchedReminders.filter { r in
    if let fc = fetchComplete { return r.isCompleted == fc }
    return true
  }

  let reminders = filtered.map { r -> [String: Any] in
    var dict: [String: Any] = [
      "id":          r.calendarItemIdentifier,
      "title":       r.title ?? "(no title)",
      "listId":      r.calendar.calendarIdentifier,
      "listName":    r.calendar.title,
      "listColor":   hexColor(r.calendar.cgColor.flatMap { NSColor(cgColor: $0) }),
      "isCompleted": r.isCompleted,
      "hasDueTime":  r.dueDateComponents?.hour != nil,
      "priority":    r.priority,
    ]
    if r.isCompleted, let cd = r.completionDate { dict["completionDate"] = toISO(cd) }
    if let dc = r.dueDateComponents {
      var comps = dc
      comps.calendar = Calendar.current
      if let d = comps.date {
        dict["dueDate"] = r.dueDateComponents?.hour != nil ? toISO(d) : toISO(d, dateOnly: true)
      }
    }
    if let notes = r.notes { dict["notes"] = notes }
    if let url = r.url { dict["url"] = url.absoluteString }
    return dict
  }
  output(["reminders": reminders])

// ── complete ──────────────────────────────────────────────────────────────────
case "complete":
  guard let reminderId = named["id"] else { fail("complete requires --id") }
  requestAccess(store: store, entity: .reminder)

  let predicate = store.predicateForReminders(in: nil)
  let sema = DispatchSemaphore(value: 0)
  var target: EKReminder? = nil

  store.fetchReminders(matching: predicate) { result in
    target = result?.first { $0.calendarItemIdentifier == reminderId }
    sema.signal()
  }
  sema.wait()

  guard let reminder = target else { fail("Reminder not found: \(reminderId)") }
  reminder.isCompleted = true
  reminder.completionDate = Date()

  do {
    try store.save(reminder, commit: true)
    output(["success": true])
  } catch {
    fail("Failed to save reminder: \(error.localizedDescription)")
  }

default:
  fail("Unknown command: \(command). Valid commands: calendars, events, reminder-lists, reminders, complete")
}
