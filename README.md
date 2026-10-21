# CasePath

Mobile-first destination for Ramos James Law video SMS. Clients open a personalized link and see their current case stage, one featured video, and the copy that belongs to that video.

CasePath is the page the existing campaigns link to. It is not a new sending engine. Campaign timing, case-type filters, attorney allow-lists, Slack approval, and Quo delivery stay in Case Tracker.

Findings below were checked against the shared DocketFlow database on 21 October 2026. Sender behavior is from the Case Tracker snapshot at `Documents/Codex/2026-05-17/files-mentioned-by-the-user-aa/attorney-case-tracker`. That app is not checked out in this workspace and is not on the UFOBob069 GitHub account. Recheck the closure-stage mapping in the deployed Case Tracker repo before changing the sender.

## What already exists

| System | Role for CasePath |
| --- | --- |
| Case Tracker | Campaign editor, match rules, Slack approval, Quo send |
| DocketFlow (`docket-calendar`) | Case record, type, language, phone, Quo contact. Shares one Supabase project with Case Tracker |
| `sms_automations` | Stable video id, English and Spanish YouTube URLs, eligibility |
| `sms_pending_approvals` | Which videos were actually sent to a case |
| `case_tracker_entries` | Current stage, `has_ever_been_litigation`, `updated_at` |
| `case_tracker_results` | Settlement date and disbursement |

Message templates do not contain the video link. `buildAutomationMessage` chooses the English or Spanish template and YouTube URL. `renderSmsMessage` appends that URL. Match rules live in `automation-match.ts`.

Preferred language on cases: 400 English, 209 Spanish, 67 unset. Unset stays English, matching current SMS behavior. CasePath pages need both languages from the start.

## Production campaigns

All seven video campaigns are enabled. Each has an attorney allow-list of 7. Rows were last edited 8 October 2026. An eighth enabled row, Manual Trigger, has no video and stays out of CasePath until it has published content.

| Campaign | Trigger to preserve | Client stage |
| --- | --- | --- |
| Welcome Video | Onboarding, signing + 1 hour, all case types | Getting Started |
| Property Damage | Onboarding, signing + 1 day, auto and 18-wheeler | Getting Started |
| Social Media Warning | Onboarding, signing + 3 days, injury types | Getting Started |
| LOP Care | Onboarding, signing + 7 days, injury types | Medical Treatment |
| Dead Time | Onboarding or Treatment, signing + 30 days, all types | Whichever stage the case is in |
| Done Treating | Leaving Treatment, except Disengaged, Terminated, Referred, Settled | Demand |
| Lawsuit Filed | Any stage to Litigation, including wrongful death | Litigation |

English YouTube sources on those rows:

| Campaign | English URL |
| --- | --- |
| Welcome Video | https://youtu.be/yRegXPJNrgg |
| Property Damage | https://youtu.be/ct7WZqeP5bc |
| Social Media Warning | https://www.youtube.com/watch?v=eHCBLGPW8jE |
| LOP Care | https://youtu.be/TGE-eLHE8MI |
| Dead Time | https://youtu.be/VDOkIkW9uaA |
| Done Treating | https://www.youtube.com/watch?v=08EvEOpGoX8 |
| Lawsuit Filed | https://youtu.be/jewkYjxrJWI |

Spanish URLs are on the same rows. Strip `authuser` and any other account parameters before embedding. Use the privacy-enhanced YouTube player.

Read eligibility from `sms_automations` at request time. Do not copy case-type, attorney, enabled, or timing rules into CasePath.

## Stage mapping

Case Tracker uses short codes. Postgres stores DocketFlow enum labels. CasePath displays the client labels and does not write stages back.

| Client label | Tracker code | Stored value | How to use it |
| --- | --- | --- | --- |
| Getting Started | Onboarding | Intake | Stage 1. 20 cases. |
| Medical Treatment | Txt | Treatment | Stage 2. 204 cases. |
| Demand | Dmd | Demand | Stage 3. 28 cases. |
| Litigation | Lit | Litigation | Optional branch. 133 cases. Also `has_ever_been_litigation`. |
| Settlement | Settled | Settlement | Settlement reached. 257 cases. |
| Disbursement | none | Disbursement enum is unused | Derive from results. 0 cases use the stage. 225 have a disbursed result. 259 have a settlement date. |
| Closed | Disengaged | DISENGAGED | Own closure screen. 33 cases. |
| Closed | Referred or Terminated | Closed | May 2026 mapper writes both as Closed and reads both back as Terminated. 1 Closed row. One closure screen until they can be told apart. |

Negotiation has no stage, enum, or event. Put that guidance in Demand next-step copy. A tracker node would look like a real case event.

Show Disbursement only when the case is Settled and Case Tracker’s existing close rule is met: disbursed status Yes and a disburse date.

Show Litigation as optional unless the case is in Litigation or `has_ever_been_litigation` is true. If the case returns to Demand, the current marker follows Demand and the litigation branch stays visited.

`updated_at` on the tracker entry is a real timestamp. Label it as the case record update. Do not present percent complete, countdowns, or invented activity.

## Sender change

One change in Case Tracker, after this app can resolve test tokens:

Replace the YouTube URL appended by `renderSmsMessage` with a CasePath URL minted for that case and automation. Leave `automation-match.ts`, approval queueing, Slack approval, and `sendQuoTextMessage` as they are.

## Build in this repo

1. **Server read API.** A token resolves to one case. Response is client stage, `updated_at`, language, and published page copy. Omit injuries, notes, settlement amounts, phone, and case number.
2. **`casepath_pages`.** One row per `sms_automations.id`, with English and Spanish title, intro, takeaways, and next steps, plus publish state. Embed ids stay on the existing YouTube columns. Drafts stay off client links.
3. **Opaque tokens.** High-entropy, stored hashed, bound to the case and the automation that was sent, revocable. The base URL opens the latest sent video. A video query selects another sent page for that case. Unknown ids fall back to that home view. Expired or revoked tokens show contact recovery and no case data.
4. **Client page.** RJL header, horizontal tracker, one featured video, playlist of videos with a sent approval for this case. Browsing changes the video and leaves the current-stage marker on the real stage.

Add the copy fields to the existing Case Tracker campaign editor. Do not add a second CMS.

The contact action is a link to the approved firm phone or text number. Quo remains the firm inbox.

## Still needs an owner

- Counsel accepts an SMS link as access to stage plus published video copy, and not to medical or financial detail, before production tokens go into texts.
- Referred and Terminated can be stored separately before CasePath shows different closure screens.
- Approved firm contact destination.
- Official RJL shield file and licensed Avenir / IvyMode files. Do not draw the logo from initials.
- Live Case Tracker checkout, so the URL swap lands in the deployed app.
- RJL-approved English and Spanish page copy. The PRD “Preparing Your Demand” example is a draft.

## First build

Client shell and read API in this repo, seeded from the seven automation ids, using internal test tokens. Leave production SMS on YouTube until a staging send still passes the existing Slack approval and the campaign rows are unchanged.
