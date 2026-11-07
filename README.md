# Heliotrope: Patient Safety & Software Risk Assessment

![Platform](https://img.shields.io/badge/Platform-Atlassian%20Forge-blue)
![UI](https://img.shields.io/badge/UI-Forge%20UI%20Kit%20%28@forge/react%29-blueviolet)
![Storage](https://img.shields.io/badge/Storage-@forge/kvs-green)
![Runtime](https://img.shields.io/badge/Runtime-Node.js%2022.x-brightgreen)

Heliotrope is an Atlassian Forge app for Jira that embeds a deterministic patient safety risk assessment workflow directly into Jira, supporting medical software compliance under **IEC 62304** and **ISO 14971**.

---

## Hackathon Track & Metadata
- **Primary Category:** Apps for Specialized Industries (Healthcare & Medical Device Software)
- **Bonus Prize:** Best Marketplace published app
- **Forge App ID:** `8926276c-2a13-466e-814f-55b729f428d6`

---

## Overview & Practical Value

In regulated medical device and healthcare software engineering, defects and change requests require documented hazard analysis, risk control verification, and traceability before release.

Heliotrope integrates these controls directly into Jira across three native modules (`jira:issuePanel`, `jira:projectPage`, and `jira:workflowValidator`):

1. **Initial & Residual Risk Classification (`jira:issuePanel`):**
   - Maps **Harm Severity** (*Negligible*, *Moderate*, *Critical*) and **Initial Occurrence Probability** (*Rare*, *Possible*, *Frequent*) to IEC 62304 Software Safety Classes (`Class A`, `Class B`, `Class C`) and Risk Levels (`LOW`, `MEDIUM`, `HIGH`).
   - For `MEDIUM` and `HIGH` risk items, requires both a documented **Risk Control / Mitigation Plan** and a **Post-Mitigation (Residual) Probability** evaluation.
   - Issues remain in `Release Blocked: Mitigation Required` or `Release Blocked: Residual Risk Too High` until a mitigation plan is entered and residual risk is reduced below `HIGH`, at which point the verdict updates to `Cleared for Release`.

2. **Accountable Sign-Off & Compliance Audit Trail:**
   - Records the Jira `accountId` of the engineer or QA reviewer who signs off on the assessment (rendered via the `@forge/react` `User` component) and the exact timestamp.
   - Stores a chronological revision history (`Compliance Audit Trail`, up to 10 entries per issue) showing timestamp, reviewer, safety class, `Initial -> Residual` risk transition, and release verdict.

3. **Automated Jira Labels & Issue Properties Sync:**
   - Upon saving, synchronizes assessment status to the Jira issue via `@forge/bridge` (`requestJira`):
     - **Jira Labels:** Automatically applies `safety-class-a`, `safety-class-b`, or `safety-class-c` alongside `safety-cleared` or `release-blocked` (while preserving existing user labels), making safety posture visible on Kanban/Scrum boards and queryable via JQL.
     - **Jira Issue Property:** Writes structured JSON data to `/rest/api/3/issue/{issueKey}/properties/heliotrope.safety` for consumption by Jira Automation rules.

4. **Project Safety Risk Register (`jira:projectPage`):**
   - Adds **Heliotrope: Safety Risk Register** to the project navigation sidebar.
   - Aggregates all assessed issues in the project into a single table with summary counters (`Total Assessed Issues`, `Cleared for Release`, `Release Blocked`), eliminating manual spreadsheet exports during regulatory audits.

5. **Hard Release Gate (`jira:workflowValidator`):**
   - Provides the **Heliotrope: Patient Safety Release Gate** workflow validator.
   - When attached by a Jira administrator to a closing transition (e.g., `Mark as done`), Jira physically blocks the status transition if an issue has no recorded safety assessment or is currently `Release Blocked`.

---

## Technical Architecture

```
src/
├── frontend/
│   ├── index.jsx         # Issue panel UI: risk form, sign-off, and Compliance Audit Trail
│   ├── projectPage.jsx   # Project-level Safety Risk Register (DynamicTable + summary counters)
│   └── jiraSync.js       # Client-side sync for Jira Labels and Issue Properties via requestJira
├── resolvers/
│   └── index.js          # Backend resolvers for per-issue and project-wide @forge/kvs queries
├── riskMatrix.js         # Pure, deterministic IEC 62304 / ISO 14971 risk evaluation logic
├── validator.js          # Workflow validator blocking transitions when clearedForRelease is false
└── index.js              # Entry point exporting resolver and workflow validator handlers
```

- **Frontend:** Built strictly with native `@forge/react` UI Kit components (`Box`, `Stack`, `Inline`, `Select`, `Textfield`, `Lozenge`, `Button`, `DynamicTable`, `EmptyState`, `User`, `Spinner`).
- **Core Logic:** Pure JavaScript in `src/riskMatrix.js` with zero external dependencies or side effects.
- **Backend & Persistence:** `@forge/resolver` with `@forge/kvs` Key-Value Store (`risk-assessment-${issueId}`).
- **Permissions & Privacy:** Uses `storage:app`, `read:jira-work`, and `write:jira-work` (for label and issue property synchronization). Zero external network egress and zero third-party telemetry.

---

## Installation Link (for Judges)

Judges can install Heliotrope directly onto any Jira Cloud site using the official distribution link:

[Install Heliotrope on Jira Cloud](https://developer.atlassian.com/console/install/8926276c-2a13-466e-814f-55b729f428d6?signature=AYABeNcvG57EOi14ieyF0xcpr6AAAAADAAdhd3Mta21zAEthcm46YXdzOmttczp1cy13ZXN0LTI6NzA5NTg3ODM1MjQzOmtleS83MDVlZDY3MC1mNTdjLTQxYjUtOWY5Yi1lM2YyZGNjMTQ2ZTcAuAECAQB4CxqLTo9l4lqXuFjNim1xJM%2Bp%2F3TVP9xHS2BrU5DRRucBR6euJjEsmvfGqW2jsEnkxgAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDFQNMxT%2BQ7Pweiff3gIBEIA77xjAZjLQRPmxnTMYSJ%2BvZqR4%2FYz7qfvz%2BB%2BRfVWayGzdkFwlHAZhRoj1RFxFPxx12Sx7zTROweL3j1QAB2F3cy1rbXMAS2Fybjphd3M6a21zOmV1LXdlc3QtMTo3MDk1ODc4MzUyNDM6a2V5LzQ2MzBjZTZiLTAwYzMtNGRlMi04NzdiLTYyN2UyMDYwZTVjYwC4AQICAHi9bVMAkme4qVQX1fQHo6ePw3H40A7cGfz7yrmSfBWMXgEY%2BCGFCpCOpVCc6RSoZGVhAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMnlJq2seDr5t6UgXzAgEQgDukjrqOnDYsIeUiFZLuPGJODUbaF%2FLncnHWUhUtuj1hix9NFoFodmw%2Bf%2Bpo99nETVWDiUSt7HtfgRIMBAAHYXdzLWttcwBLYXJuOmF3czprbXM6dXMtZWFzdC0xOjcwOTU4NzgzNTI0MzprZXkvNmMxMjBiYTAtNGNkNS00OTg1LWI4MmUtNDBhMDQ5NTJjYzU3ALgBAgIAeDYASx0XCjkny4iLV6vz%2BKtEGSGT6kdt0QRpkn6D%2FlVEAaj6Y3qtvkawbajco2xqYGoAAAB%2BMHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAw%2BL%2B0etTDHZ7Nu4pACARCAO1gLhok%2BMU4KT2IDNR5gSxjkN2ek%2BVHATyDcCfvehBt7S5dg9Es2mVPeg8qb03dDAw440TzRsd9bOh6kAgAAAAAMAAAQAAAAAAAAAAAAAAAAAIKNfe42AfmkYF2F0S42Lir%2F%2F%2F%2F%2FAAAAAQAAAAAAAAAAAAAAAQAAADLG5TiFC44rZI1C6zOW%2F1ZrQF4C%2BD%2FOZw3pYupg0Kl7ltH%2FTW6rdCxg4v9aPi%2B5qpRpVKZhuh3Gr1nTF0S%2FuyHbqrY%3D&product=jira)

---

## Testing Instructions

### Part 1: Issue Panel, Audit Trail & Jira Labels (Works out of the box)
1. **Install App:** Open the installation link above and select your Jira Cloud site.
2. **Open an Issue:** Navigate to any Jira project and open an issue (or create a new one).
3. **Locate Panel:** Open the **Heliotrope: Patient Safety Assessment** issue panel.
4. **Verify Baseline:** Default values (*Negligible* / *Rare*) evaluate to `Class A`, `LOW` risk, with verdict `Cleared for Release`.
5. **Trigger Risk Escalation:**
   - Change *Harm Severity* to `Critical (Permanent injury or life-threatening)` and *Initial Occurrence Probability* to `Frequent (Regular occurrence)`.
   - The matrix escalates to `Class C` (`HIGH` initial risk) and displays `Release Blocked: Mitigation Required`.
   - The *Risk Control / Mitigation Plan* input and *Post-Mitigation (Residual) Probability* selector appear.
6. **Apply Mitigation & Residual Risk:**
   - Enter a mitigation plan (e.g., `Added hardware dosage limiter and unit test verification`).
   - Set *Post-Mitigation (Residual) Probability* to `Rare (Unlikely to occur)`.
   - Residual Risk updates to `MEDIUM`, and Release Verdict updates to `Cleared for Release`.
7. **Sign Off & Verify Audit Trail:**
   - Click **Sign Off & Save**.
   - Verify that your Jira user profile, timestamp, and a new row in the **Compliance Audit Trail** table appear.
   - Check the issue's **Labels** field in Jira to confirm `safety-class-c` and `safety-cleared` were automatically applied.
   - Reload the page (`F5`) to confirm persistence from `@forge/kvs`.

### Part 2: Project Safety Risk Register (Works out of the box)
1. In the left project sidebar, select **Heliotrope: Safety Risk Register**.
2. Verify the summary counters (`Total Assessed Issues`, `Cleared for Release`, `Release Blocked`) and the aggregated compliance table listing all assessed issues in the project.

### Part 3: Workflow Release Gate (`jira:workflowValidator` — Optional Admin Enforcement)
1. Open an issue, click the status dropdown → **View workflow** → **Edit workflow**.
2. In the workflow diagram, select the transition leading to **Done** (e.g., `Mark as done`).
3. Under **Rules** → **Validate details**, click **+** and select **Heliotrope: Patient Safety Release Gate**, then click **Add** and **Update workflow**.
4. In an issue, save a blocked assessment (e.g., `Critical` severity with an empty mitigation plan) and attempt to transition the issue to **Done**. Confirm that Jira blocks the transition with the Heliotrope Safety Gate error message.
5. Enter a valid mitigation plan, click **Sign Off & Save** (`Cleared for Release`), and transition the issue to **Done** — the transition now succeeds.

---

## Local Development

```bash
# Install dependencies
npm install

# Validate manifest and code
forge lint

# Deploy to development
forge deploy

# Deploy to production (with scope upgrade approval if applicable)
forge deploy -e production --approve MAJOR_VERSION_RULE
```

---

## Privacy Policy & Support

- **Data Storage & Residency:** Heliotrope runs entirely on Atlassian Forge (Runs on Atlassian). All safety assessment records are stored exclusively within the customer's Atlassian Cloud tenant using `@forge/kvs` and Jira Issue Properties.
- **No Personal Data Collection:** The app does not collect, transmit, or store Personally Identifiable Information (PII) or Protected Health Information (PHI) on external servers. User references are handled strictly via native Atlassian `accountId` identifiers within Jira.
- **No Third-Party Egress:** The app makes zero external network requests and includes no third-party analytics or tracking scripts.
- **Support & Contact:** For bug reports, feature requests, or support inquiries, please open an issue at [https://github.com/vero-code/heliotrope/issues](https://github.com/vero-code/heliotrope/issues).

---

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
