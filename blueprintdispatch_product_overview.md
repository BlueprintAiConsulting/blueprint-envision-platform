# BlueprintDispatch — Complete Technical & Business Product Overview

> **One-line pitch:** BlueprintDispatch is an AI receptionist platform for home service businesses that answers every inbound call and text 24/7, qualifies leads, books appointments directly to Google Calendar, scores leads by urgency, and sends after-hours SMS — all without a human.

---

## What It Is

BlueprintDispatch is a white-labeled, multi-vertical SaaS platform built for trade contractors and home service companies. It replaces or augments a human receptionist by handling inbound phone calls and text messages using Google's **Gemini 2.0 Flash Live Audio** AI, connected through **Twilio** for phone/SMS infrastructure.

The business owner gets a **web dashboard** to review leads, manage the AI configuration, test the system, and view call history.

---

## Core Technology Stack

| Layer | Technology |
|---|---|
| AI Voice Engine | Google Gemini 2.0 Flash Live (`gemini-3.1-flash-live-preview`) |
| Phone & SMS | Twilio Voice + Twilio Messaging |
| Audio Bridge | WebSocket media stream (mulaw 8kHz ↔ PCM 16kHz/24kHz) |
| AI Voice Name | "Kore" (Gemini prebuilt professional female voice) |
| Database | Firebase Firestore (real-time) |
| Auth | Firebase Authentication (email/password) |
| Calendar | Google Calendar API (service account) |
| Frontend | React + Vite (TypeScript), React Router v6 |
| Backend | Node.js + Express + `ws` WebSocket server |
| Hosting | Render.com (always-on, 24/7, auto-deploy from GitHub) |
| Lead Scoring | Gemini 2.0 Flash (post-call async analysis) |

---

## Full Feature List

### 1. 📞 AI Phone Receptionist (Live Audio)

**What it does:**
- When someone calls the Twilio phone number, the call is routed to BlueprintDispatch
- The AI answers in real-time using Gemini Live Audio — true streaming two-way audio, not IVR menus or pre-recorded prompts
- The AI conducts a natural voice conversation to identify the caller, their issue, and collect intake info
- The AI's persona, script, emergency logic, and intake questions change per industry

**Step-by-step call flow:**
1. Twilio receives inbound call → sends `POST /twiml` to server
2. Server imports `afterHours.ts` — checks against Firestore business hours schedule
3. **If within hours:** Server responds with TwiML that opens a WebSocket media stream
4. Twilio sends `start` event → server calls `handleMediaStream()` in `voiceBridge.ts`
5. Server loads Firestore settings → builds system instruction prompt → opens Gemini Live session
6. Server checks `getCallerHistory(callerNumber)` for returning caller context
7. Server sends an initial text prompt to kick off Gemini's greeting
8. Twilio streams G.711 mulaw audio (8kHz) → `audioUtils.ts` converts to PCM 16kHz → sent to Gemini
9. Gemini streams PCM 24kHz audio response → converted back to mulaw → sent to Twilio → played to caller
10. Gemini fires tool calls (`saveLead`, `bookAppointment`, `transferCall`) mid-conversation
11. Call ends → `cleanupSession()` runs → Gemini session closed, session removed from map

**Key behaviors:**
- Detects emergencies from configurable keyword list and escalates immediately
- Offers live call transfer to business owner for emergencies during hours
- Greets returning callers by name with context from their last call
- Books appointments on the spot using `bookAppointment` tool
- Calls `saveLead` only after verifying name + address + reason (enforced in system prompt)

---

### 2. 🔊 Audio Processing Pipeline (voiceBridge.ts + audioUtils.ts)

This is the technical core of the product:

```
Caller speaks (phone call)
      ↓
Twilio sends binary G.711 µ-law audio frames at 8kHz over WebSocket
      ↓  [audioUtils: twilioToGemini()]
Convert µ-law → PCM 16kHz (Gemini's expected input format)
      ↓
Gemini Live receives audio and processes speech in real-time
      ↓
Gemini responds with PCM 24kHz raw audio
      ↓  [audioUtils: geminiToTwilio()]
Convert PCM 24kHz → µ-law 8kHz (Twilio's expected format)
      ↓
Twilio plays audio to caller
```

**Session state object (one per active call):**
```typescript
interface CallSession {
  geminiSession: any;          // The live Gemini connection
  callerNumber: string;        // Caller's E.164 phone number
  streamSid: string;           // Twilio stream ID (session key)
  callSid: string;             // Twilio call ID (for live transfer)
  transcript: { role, text }[]; // Running transcript (user + assistant turns)
  leadSaved: boolean;          // Prevents duplicate saves
  adminNumber: string;         // Business owner's SMS alert number
  crmSettings: { enabled, url }; // CRM webhook config
  pendingBooking?: { event_id, booked_start, event_link }; // Set by bookAppointment
}
```

All active calls are tracked in `activeSessions: Map<streamSid, CallSession>`.

**Partial lead safety net:** If the call ends and `leadSaved === false` but `transcript.length > 2`, the server automatically saves a partial lead with the raw transcript and caller number. This ensures no call is ever silently lost.

---

### 3. 🤖 Gemini Tool Definitions

Gemini has three function tools available during a live call. Tools are conditionally enabled per settings.

#### `saveLead` — Required: `callback_number`, `call_type`, `emergency_flag`
```
caller_name          string   — Full name of caller
callback_number      string   — Phone number (falls back to Twilio's FROM if missing)
reason_for_call      string   — Brief description of the call
call_type            enum     — estimate_request | emergency | repair_request |
                                existing_customer | general_office | spam |
                                service_call | project_inquiry | seasonal_service |
                                design_consultation | commercial_inquiry | maintenance_inquiry
emergency_flag       boolean  — true ONLY for active emergencies
emergency_type       string   — Description of emergency type
property_address     string   — Service property address
customer_type        string   — "residential" or "commercial"
issue_description    string   — Detailed description of the issue
preferred_appointment_date string — Requested date
preferred_time_window string  — Requested time window
insurance_claim      boolean  — Is this an insurance claim?
ai_summary           string   — Gemini's summary of the conversation
call_status          enum     — new | contacted | booked | closed | spam |
                                emergency_follow_up | after_hours_follow_up
```
**Guardrail:** `leadSaved` flag in the session prevents duplicate saves if AI calls it twice.

#### `bookAppointment` — Required: `caller_name`, `callback_number`, `property_address`, `service_type`, `preferred_date`, `preferred_time`
```
caller_name          string   — Full name
callback_number      string   — Phone number
property_address     string   — Service address
service_type         string   — e.g., "Roof Estimate", "HVAC Repair"
preferred_date       string   — YYYY-MM-DD format
preferred_time       string   — HH:MM 24h format (e.g., "14:00")
notes                string   — Optional additional notes
```
Calls `calendarUtils.ts` → Google Calendar API → creates event → returns `event_id`, `booked_start`, `event_link`. Result stored in `session.pendingBooking` then merged into `saveLead` call.

#### `transferCall` — Required: `reason` (conditionally enabled when `transfer_enabled = true`)
```
reason               string   — Why the transfer is happening
```
Calls `twilioUtils.transferLiveCall(callSid, targetNumber)`. Uses Twilio's `calls().update({ twiml })` API to inject a `<Dial>` verb mid-call, routing the caller to the business owner's number. AI session is immediately closed after transfer.

---

### 4. 💬 Notification System (3-tier SMS)

Every saved lead triggers three async notification actions (all fire-and-forget):

#### Tier 1 — Customer Follow-Up SMS
Sent to the caller's number immediately after `saveLead`:
- **Emergency:** "We received your emergency request regarding [address] and our team is reviewing it immediately."
- **Estimate/Repair:** "We've received your request regarding [address] and our team will be in touch shortly to schedule!"
- **General:** "We've received your request and our team will be in touch shortly."

#### Tier 2 — Admin Alert SMS
Sent to the business owner's transfer phone number:
```
🔔 NEW LEAD:      (or 🚨 EMERGENCY LEAD:)
Type: ESTIMATE REQUEST
Name: Mike Johnson
Phone: +15551234567
Address: 123 Main St, Brooklyn NY
Reason: Water coming through ceiling
```

#### Tier 3 — After-Hours SMS (separate flow)
When someone calls outside business hours, `afterHours.ts` fires:
- Plays TwiML voice message: *"Our office is currently closed. We just sent you a text."*
- Sends configurable SMS template to caller from Settings
- Logs a "missed call" lead to Firestore with `call_status: 'after_hours_follow_up'`

---

### 5. 🔁 Returning Caller Detection

Before the AI greets the caller, `getCallerHistory(callerNumber)` queries Firestore for any previous lead documents with that phone number. If found, it builds a context string:
```
"Previous call: estimate request at 123 Main St on April 1. Emergency flag: false. Status: contacted."
```
This is injected into the AI's initial prompt as a system context block. The AI then greets the caller by name and references their past interaction naturally.

---

### 6. 📅 Google Calendar Booking

**What it does:**
- AI books real appointments directly to Google Calendar during the call
- Caller gets a confirmation audio response immediately after booking
- Firestore lead record updated with `calendar_event_id` and `calendar_event_link`

**How it works:**
- Uses a Google Service Account (`GOOGLE_SERVICE_ACCOUNT_JSON` env var)
- Service account is shared on the business's calendar with "Make changes to events" permission
- `GOOGLE_CALENDAR_ID` env var specifies which calendar to write to
- `calendarUtils.ts` uses `googleapis` library to call `calendar.events.insert()`
- `BUSINESS_TIMEZONE` env var used for correct timezone conversion
- Calendar booking is feature-flagged: if `isCalendarEnabled()` returns false, the `bookAppointment` tool is hidden from Gemini entirely and the system prompt tells it to capture preferred times in `saveLead` instead

---

### 7. 🎯 AI Lead Scoring (Post-Call)

**What it does:**
- After every lead save, `scoreLead()` in `leadScoring.ts` runs asynchronously
- Sends transcript + issue description + call type to Gemini for analysis
- Returns structured JSON with score, priority, reason, and flags
- Writes result back to the Firestore lead document

**Score tiers:**
| Score | Priority | Badge Color | Meaning |
|---|---|---|---|
| 9–10 | Critical | 🔴 Red | Active emergency — call back immediately |
| 7–8 | High | 🟠 Orange | Urgent repair, strong buying intent |
| 5–6 | Medium | 🟡 Yellow | Quote request, reasonable timeline |
| 3–4 | Low | ⚪ Stone | Price shopping, low urgency |
| 1–2 | Minimal | ⚪ Stone | Wrong number, spam, dead air |

**Stored fields on lead document:**
```
lead_score     number   — 1–10
lead_priority  string   — "critical" | "high" | "medium" | "low" | "minimal"
score_reason   string   — One sentence explaining the score
score_flags    string[] — e.g., ["emergency", "active_leak", "insurance_claim", "elderly_vulnerable"]
scored_at      timestamp
```

**Design:** Non-blocking. Uses `.catch(e => console.error(e))` — a scoring failure never crashes the lead save.

---

### 8. 📊 Lead Management Dashboard

**What it does:**
- Authenticated web UI listing all Firestore leads in a sortable table
- Click any row → detail panel slides in with full info
- Lead status can be changed inline

**Lead table columns:**
- Caller name + phone
- Lead score badge (color-coded)
- Call type pill
- Emergency flag indicator
- Property address
- Timestamp

**Detail panel shows:**
- All captured fields
- AI-generated summary
- Full transcript (collapsible, role-labeled)
- AI Lead Score card (score, priority, reason, flags)
- Google Calendar event link (if booked)
- Status selector (New → Contacted → Booked → Closed → Spam → Emergency Follow-Up)
- Action buttons: Call back, Text, Archive

**Access control:** Firebase Auth — user must be logged in. If not authenticated, the dashboard redirects or shows an empty state (Settings does the same — shows DEFAULT_SETTINGS for unauthenticated users but Firestore writes will fail without auth).

---

### 9. ⚙️ Business Configuration (Settings)

**Stored in:** Firestore `settings/config` document

| Setting | Key | Type | Description |
|---|---|---|---|
| Company Name | `office_name` | string | AI greeting name |
| Industry Mode | `industry_mode` | enum | Changes AI persona |
| Business Hours | `business_hours` | object | Per-day open/close + enabled |
| Timezone | `timezone` | string | IANA tz (e.g., "America/New_York") |
| Service Areas | `service_areas` | string[] | Referenced in AI context |
| Transfer Enabled | `transfer_enabled` | boolean | Enables `transferCall` tool |
| Transfer Phone | `transfer_phone_number` | string | E.164 owner phone for transfers |
| Emergency Keywords | `emergency_keywords` | string[] | Override per-vertical defaults |
| Voice Style | `receptionist_voice_style` | string | Personality instruction |
| After-Hours Voice Msg | `after_hours_message` | string | TTS played on after-hours calls |
| After-Hours SMS | `after_hours_sms_message` | string | SMS template sent to after-hours callers |
| Prompt Overrides | `prompt_overrides` | string | Free-text appended to system prompt |
| CRM Sync | `crm_sync_enabled` | boolean | Enables webhook push |
| CRM URL | `crm_webhook_url` | string | Endpoint for lead POST |
| Calendar | `calendar_enabled` | boolean | Enables `bookAppointment` tool |
| Calendar ID | `calendar_id` | string | Google Calendar ID |
| Appt Duration | `appointment_duration_minutes` | number | Default slot length |

---

### 10. 🏗 Multi-Vertical Industry Support (8 Verticals)

Each vertical defined in `verticalConfigs.ts` has:
```typescript
{
  label: string,               // Display name
  emoji: string,               // Icon shown in UI
  description: string,         // Short description for settings card
  systemPersona: string,       // Full system prompt persona block
  intakeLogic: string,         // What questions to ask and in what order
  emergencyCriteria: string,   // What constitutes an emergency for this trade
  defaultEmergencyKeywords: string[], // Auto-populated if Settings field is empty
}
```

| Industry | Label | Key Emergency Examples |
|---|---|---|
| roofing | 🏠 Roofing | Leak, storm, tree, water intrusion, tarp |
| hvac | 🔧 HVAC | No heat (winter), no AC (heat), elderly/infant |
| painting | 🎨 Painting | Water damage, mold, HOA violation deadline |
| landscaping | 🌿 Landscaping | Storm damage, flooding, drainage emergency |
| general_construction | 🏗 Construction | Structural damage, permit urgency |
| exterior_contractor | 🏠 Exterior | Storm damage, broken window (security breach) |
| remodeling | 🏠 Remodeling | Water damage, habitability issue |
| pool_spa | 🏊 Pool & Spa | Equipment failure, chemical/safety emergency |

---

### 11. 🖥 Call Simulator (QA / Testing)

**Route:** `/simulator`

**What it does:**
- Allows testing the AI voice pipeline without making a real Twilio call
- Runs the same Gemini session as a live call
- Shows real-time transcript
- Pre-built test scenarios that inject scripted caller profiles:
  - Emergency roof leak
  - Estimate request (non-urgent)
  - Repeat customer check-in
  - Wrong number / spam
  - After-hours caller
  - Commercial inquiry

**Purpose:** Pre-sales testing, QA verification after config changes, developer debugging.

---

### 12. 🧪 QA Tests Page

**Route:** `/qa`

**What it does:**
- Automated test suite that runs end-to-end checks on the backend
- Tests include: Firestore connectivity, Twilio credentials valid, Gemini API auth, Calendar API auth, settings document exists, health endpoint response
- Results displayed with pass/fail status and latency
- Not customer-facing — internal testing tool

---

### 13. 🎬 Client Demo Mode

**Route:** `/demo` (full-screen, no sidebar — built for sales presentations)

**Tab 1 — Phone Call Demo:**
- Animated iPhone mockup
- Scripted roofing call auto-plays with timed transcript entries
- Lead card populates in real-time as info is "captured"
- Shows "Alex with BlueprintDispatch" as the AI voice

**Tab 2 — SMS Demo:**
- iMessage-style chat UI
- HVAC emergency scenario with typing indicators
- Appointment booking confirmation shown at end

**Tab 3 — App Preview:**
- 4 interactive slides of the actual dashboard UI:
  1. Real-Time Lead Dashboard
  2. Call Simulator
  3. Google Calendar Booking
  4. Multi-Industry Switching

**Usage:** Share `/demo` URL with a prospect or display during a sales call on screen.

---

## Complete Data Flow Diagram

```
Caller dials Twilio number
         ↓
POST /twiml → server.ts
         ↓
afterHours.ts checks:
  settings.business_hours[dayOfWeek].enabled ?
  current time between .open and .close ?
  using settings.timezone ?
         ↓
[WITHIN HOURS]                    [AFTER HOURS]
         ↓                                ↓
TwiML → <Connect>                  TwiML → <Say> + hangup
  <Stream ws="/media-stream">      twilioUtils.sendSMS(callerNumber, smsTemplate)
         ↓                         Firestore.addLead({ call_status: 'after_hours_follow_up' })
WebSocket opens /media-stream
voiceBridge.handleMediaStream()
         ↓
Twilio EVENT: "start"
  → loadSettings() from Firestore
  → buildSystemInstruction(settings) with vertical persona
  → ai.live.connect({ model, config, tools, voice: 'Kore' })
  → getCallerHistory(callerNumber) → returning caller context
  → session.sendRealtimeInput({ text: initialPrompt })
  → activeSessions.set(streamSid, callSession)
         ↓
Twilio EVENT: "media" (every ~20ms)
  → base64 mulaw → Buffer → twilioToGemini() → PCM 16kHz
  → session.sendRealtimeInput({ audio })
         ↓
Gemini responds:
  → PCM 24kHz audio → geminiToTwilio() → mulaw → twilioWs.send()
  → inputTranscription.text → session.transcript.push({ role: 'user' })
  → outputTranscription.text → session.transcript.push({ role: 'assistant' })
  → toolCall? → handle saveLead / bookAppointment / transferCall
         ↓
TOOL: bookAppointment
  → calendarUtils.bookAppointment() → Google Calendar API
  → session.pendingBooking = { event_id, booked_start, event_link }
  → sendToolResponse({ result: "Appointment booked..." })
         ↓
TOOL: saveLead
  → geminiService.processLead(leadData + transcript)
  → Firestore.addDoc('leads', { ...all fields })
  → returns docId
  → [background] sendCustomerFollowUp(lead) → SMS to caller
  → [background] sendAdminAlert(lead, adminNumber) → SMS to owner
  → [background] syncLeadToCrm(lead, url) if crm_sync_enabled
  → [background] scoreLead(docId, transcript, description, callType)
         ↓
TOOL: transferCall
  → twilioUtils.transferLiveCall(callSid, targetNumber)
  → Twilio API: calls(callSid).update({ twiml: '<Dial>targetNumber</Dial>' })
  → geminiSession.close()
         ↓
Twilio EVENT: "stop" or WebSocket close
  → cleanupSession(streamSid)
  → if !leadSaved && transcript.length > 2 → save partial lead
  → scoreLead(partialDocId, transcript) if partial saved
  → geminiSession.close()
  → activeSessions.delete(streamSid)
         ↓
2–5 seconds later:
scoreLead() completes:
  → Firestore.updateDoc(docId, { lead_score, lead_priority, score_reason, score_flags, scored_at })
         ↓
Lead appears in Dashboard with color-coded score badge
```

---

## Complete Firestore Lead Document

```json
{
  "id": "auto-generated Firestore doc ID",
  "caller_name": "Mike Johnson",
  "callback_number": "+15551234567",
  "reason_for_call": "Roof leak, water coming through ceiling",
  "call_type": "emergency",
  "emergency_flag": true,
  "emergency_type": "Active interior ceiling leak",
  "property_address": "123 Main St, Brooklyn NY 11201",
  "customer_type": "residential",
  "issue_description": "Water actively leaking through living room ceiling during rain",
  "preferred_appointment_date": "Today or tomorrow",
  "preferred_time_window": "As soon as possible",
  "insurance_claim": false,
  "ai_summary": "Emergency leak, ceiling damage in living room, rain-related. Needs immediate inspection.",
  "transcript": [
    { "role": "assistant", "text": "Thank you for calling, how can I help you today?" },
    { "role": "user", "text": "Yeah I've got water coming through my ceiling..." }
  ],
  "call_status": "new",
  "follow_up_required": false,
  "lead_score": 9,
  "lead_priority": "critical",
  "score_reason": "Active interior ceiling leak during active rain with immediate water damage risk",
  "score_flags": ["emergency", "active_leak", "storm_damage"],
  "calendar_event_id": null,
  "calendar_event_link": null,
  "created_at": "2026-04-03T03:00:00Z",
  "scored_at": "2026-04-03T03:00:06Z"
}
```

---

## Lead Status State Machine

```
[new] → [contacted] → [booked] → [closed]
  ↓                               ↑
[spam]               [emergency_follow_up]
                     [after_hours_follow_up]
```

Status is set by AI at save time and can be overridden manually in Dashboard.

---

## Environment Variables (Complete List)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `TWILIO_ACCOUNT_SID` | ✅ | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | ✅ | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | ✅ | Twilio number in E.164 format |
| `APP_URL` | ✅ | Public URL of this server (for Twilio webhook) |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Optional | Base64-encoded service account JSON for Calendar |
| `GOOGLE_CALENDAR_ID` | Optional | Calendar ID to book appointments into |
| `BUSINESS_TIMEZONE` | Optional | Default: "America/New_York" |
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `PORT` | Optional | Server port (default: 8080) |

---

## Firestore Collections

| Collection | Document | Description |
|---|---|---|
| `leads` | auto-ID | One document per call/lead |
| `settings` | `config` | Single config document for the whole business |

---

## Error Handling & Failsafes

| Scenario | Behavior |
|---|---|
| Firestore settings load fails | Falls back to hardcoded `DEFAULT_SETTINGS`, call continues |
| Gemini session fails to open | WebSocket closes cleanly, call ends gracefully |
| `bookAppointment` API fails | AI told to tell caller "someone will call to confirm" |
| `saveLead` Firestore write fails | Tool response returned anyway, call continues |
| Call ends without `saveLead` | Partial lead auto-saved if transcript has content |
| Lead scoring fails | Silently caught, lead still visible without score |
| Admin SMS fails | Silently caught, lead is already saved |
| Business hours Firestore check fails | Defaults to CONNECTING the AI (never drops a call) |
| Live transfer fails | Caller stays on AI line, AI continues conversation |

---

## Frontend Routing Structure

```
/              → Dashboard (lead table + detail panel)
/simulator     → Call Simulator
/qa            → QA Test Suite
/settings      → Business Configuration
/demo          → Client Demo (full-screen, no sidebar)
```

All routes except `/demo` are wrapped in the sidebar layout. `/demo` is a separate full-screen route for clean client presentations.

---

## Competitive Advantages

1. **True live audio** — Gemini hears and speaks in real-time, sounds fully human, no menus
2. **Multi-vertical** — one platform, 8 industries, AI persona changes completely per client
3. **Full lead record** — every call produces a scored, summarized, transcribed lead
4. **Google Calendar native** — booking happens during the call, not just "captured"
5. **After-hours never drops** — callers outside hours get an instant SMS + are logged
6. **Returning caller memory** — AI recognizes past callers and greets them by name
7. **Partial lead safety net** — even dropped calls get saved with transcript
8. **Non-blocking post-processing** — scoring, SMS, CRM sync never slow down the call
9. **Zero human needed** — ring → lead → calendar event → scored in ~10 seconds total
10. **White-label ready** — all branding, persona, and messaging configurable per client

---

## Current Limitations

- Not multi-tenant yet (one Firestore config per deployment)
- AI voice is Gemini's "Kore" — no custom voice cloning yet (ElevenLabs planned)
- Outbound calling not implemented (inbound only)
- No in-app billing or subscription management
- CRM integration is generic webhook — no native HubSpot/Salesforce connectors yet
- Twilio signature validation currently bypassed (acceptable for single-tenant, must fix for multi-tenant)

---

## Roadmap

1. **Multi-tenant SaaS** — Separate `client_id` namespace per account in Firestore
2. **Voice Cloning** — ElevenLabs integration for custom voice personas per client
3. **Outbound Follow-up Calls** — AI auto-calls unresponded leads
4. **Advanced Analytics** — Score trends, conversion rate, peak call times, avg call duration
5. **Stripe Billing** — In-app subscription management for clients
6. **Native CRM Connectors** — HubSpot, Salesforce, Jobber direct integrations

---

## Pricing Model Inputs

**Per-client cost drivers:**
- Twilio inbound: ~$0.0085/min voice + ~$0.005/min media stream
- Gemini Live API: ~$0.10–$0.30 per call (varies by length)
- Twilio SMS: ~$0.0079/message (customer followup + admin alert = ~$0.016/call)
- Firestore: negligible at single-client scale
- Render hosting: $25–$85/month (shared until multi-tenant)

**Value delivered per client:**
- Human receptionist replacement: $2,500–$5,000/month saved labor
- After-hours coverage: 30–40% of calls come after hours — previously all lost
- Emergency detection: one caught emergency = $3,000–$15,000 project
- Lead scoring: business owners call back critical leads first — higher conversion

**Suggested SaaS tier structure basis:**
- Calls/month handled (volume)
- AI minutes used
- SMS credits (after-hours + follow-ups)
- Calendar booking enabled (premium feature)
- CRM webhook enabled (premium feature)
- Number of industry verticals configured
- Dedicated deployment vs shared (multi-tenant)
