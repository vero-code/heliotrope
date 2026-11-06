# Heliotrope: Patient Safety & Software Risk Assessment

![Platform](https://img.shields.io/badge/Platform-Atlassian%20Forge-blue)
![UI](https://img.shields.io/badge/UI-Forge%20UI%20Kit%20%28@forge/react%29-blueviolet)
![Storage](https://img.shields.io/badge/Storage-@forge/kvs-green)
![Runtime](https://img.shields.io/badge/Runtime-Node.js%2024.x-brightgreen)

Heliotrope is an Atlassian Forge app for Jira that embeds a deterministic patient safety risk assessment engine directly into Jira issue panels, enforcing medical software compliance standards (**IEC 62304** and **ISO 14971**).

---

## Category
**Apps for Specialized Industries** (Healthcare & Medical Device Software)

---

## Overview

In regulated medical device and healthcare software development, defects and change requests must undergo formal patient safety evaluation before code can be released.

Heliotrope eliminates administrative friction by integrating a real-time risk classification matrix directly into the Jira issue view:
- **IEC 62304 Safety Classification:** Maps Harm Severity (*Negligible*, *Moderate*, *Critical*) and Occurrence Probability (*Rare*, *Possible*, *Frequent*) into Software Safety Classes (*Class A*, *Class B*, *Class C*) and Risk Levels (*Low*, *Medium*, *High*).
- **Automated Release Gating:** Issues evaluated as Medium or High risk require a mandatory Risk Mitigation Plan. The status remains `Release Blocked: Mitigation Required` until mitigation is recorded, upon which it switches to `Cleared for Release`.
- **Audit Sign-Off:** Records the verified assessment state and timestamp for compliance audits.

---

## Technical Architecture

```
src/
├── frontend/
│   └── index.jsx       # Atlassian UI Kit (@forge/react) issue panel interface
├── resolvers/
│   └── index.js        # Forge backend resolvers handling @forge/kvs operations
├── riskMatrix.js       # Pure, deterministic IEC 62304 / ISO 14971 risk matrix logic
└── index.js            # Entry point exporting resolver handlers
```

- **Frontend:** Built with native `@forge/react` UI Kit components (`Box`, `Stack`, `Inline`, `Select`, `Textfield`, `Lozenge`, `Button`).
- **Core Logic:** Pure JavaScript functions in `src/riskMatrix.js` without third-party dependencies or side effects.
- **Backend & Storage:** `@forge/resolver` with modern `@forge/kvs` Key-Value Store. Data is scoped per issue ID (`risk-assessment-${issueId}`).
- **Security:** Requires only `storage:app` scope. Zero third-party network egress, zero external telemetry, zero storage of Personally Identifiable Information (PII).

---

## Installation Link (for Judges)

Judges can install Heliotrope directly onto any Jira Cloud site using the official distribution link:

[Install Heliotrope on Jira Cloud](https://developer.atlassian.com/console/install/8926276c-2a13-466e-814f-55b729f428d6?signature=AYABeNcvG57EOi14ieyF0xcpr6AAAAADAAdhd3Mta21zAEthcm46YXdzOmttczp1cy13ZXN0LTI6NzA5NTg3ODM1MjQzOmtleS83MDVlZDY3MC1mNTdjLTQxYjUtOWY5Yi1lM2YyZGNjMTQ2ZTcAuAECAQB4CxqLTo9l4lqXuFjNim1xJM%2Bp%2F3TVP9xHS2BrU5DRRucBR6euJjEsmvfGqW2jsEnkxgAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDFQNMxT%2BQ7Pweiff3gIBEIA77xjAZjLQRPmxnTMYSJ%2BvZqR4%2FYz7qfvz%2BB%2BRfVWayGzdkFwlHAZhRoj1RFxFPxx12Sx7zTROweL3j1QAB2F3cy1rbXMAS2Fybjphd3M6a21zOmV1LXdlc3QtMTo3MDk1ODc4MzUyNDM6a2V5LzQ2MzBjZTZiLTAwYzMtNGRlMi04NzdiLTYyN2UyMDYwZTVjYwC4AQICAHi9bVMAkme4qVQX1fQHo6ePw3H40A7cGfz7yrmSfBWMXgEY%2BCGFCpCOpVCc6RSoZGVhAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMnlJq2seDr5t6UgXzAgEQgDukjrqOnDYsIeUiFZLuPGJODUbaF%2FLncnHWUhUtuj1hix9NFoFodmw%2Bf%2Bpo99nETVWDiUSt7HtfgRIMBAAHYXdzLWttcwBLYXJuOmF3czprbXM6dXMtZWFzdC0xOjcwOTU4NzgzNTI0MzprZXkvNmMxMjBiYTAtNGNkNS00OTg1LWI4MmUtNDBhMDQ5NTJjYzU3ALgBAgIAeDYASx0XCjkny4iLV6vz%2BKtEGSGT6kdt0QRpkn6D%2FlVEAaj6Y3qtvkawbajco2xqYGoAAAB%2BMHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAw%2BL%2B0etTDHZ7Nu4pACARCAO1gLhok%2BMU4KT2IDNR5gSxjkN2ek%2BVHATyDcCfvehBt7S5dg9Es2mVPeg8qb03dDAw440TzRsd9bOh6kAgAAAAAMAAAQAAAAAAAAAAAAAAAAAIKNfe42AfmkYF2F0S42Lir%2F%2F%2F%2F%2FAAAAAQAAAAAAAAAAAAAAAQAAADLG5TiFC44rZI1C6zOW%2F1ZrQF4C%2BD%2FOZw3pYupg0Kl7ltH%2FTW6rdCxg4v9aPi%2B5qpRpVKZhuh3Gr1nTF0S%2FuyHbqrY%3D&product=jira)

---

## Testing Instructions

1. **Install App:** Open the installation link above and select your Jira Cloud development site.
2. **Open an Issue:** Navigate to Jira and open any issue (or create a new task/bug).
3. **Locate Panel:** Open the **Heliotrope: Patient Safety Assessment** issue panel.
4. **Verify Baseline:** Default values (*Negligible* / *Rare*) evaluate to `Class A`, `LOW` risk, with status `Cleared for Release`.
5. **Trigger Risk Escalation:**
   - Change *Harm Severity* to `Critical (Permanent injury or life-threatening)`.
   - The matrix automatically escalates to `Class B` (`MEDIUM` risk).
   - *Release Status* switches to `Release Blocked: Mitigation Required`.
   - The *Risk Mitigation Plan* input field dynamically appears.
6. **Escalate to High Risk:**
   - Change *Occurrence Probability* to `Possible` or `Frequent`.
   - Safety Class escalates to `Class C` (`HIGH` risk).
7. **Apply Mitigation:**
   - Enter a mitigation description in *Risk Mitigation Plan* (e.g., `Hardware limiter verified by QA`).
   - *Release Status* immediately updates to `Cleared for Release`.
8. **Save & Persist:**
   - Click `Save Assessment`. An audit timestamp (`Saved: <date/time>`) appears.
   - Reload the page (`F5`). All assessment parameters, mitigation text, and timestamp reload from `@forge/kvs`.

---

## Local Development

```bash
# Install dependencies
npm install

# Validate manifest and code
forge lint

# Deploy to development
forge deploy

# Deploy to production
forge deploy -e production
```

---

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.
