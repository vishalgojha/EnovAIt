# April 10 Demo Plan

Goal: deliver a production-looking EnovAIt demo for Rustomjee that feels like a real India-first BRSR SaaS, not a dev tool.

## Already Done

- [x] ~~Integrated Archon as an internal orchestration layer.~~
- [x] ~~Reverse engineered the BRSR PDF into an India-first product blueprint.~~
- [x] ~~Added a dedicated `BRSR India` module and `BRSR India Annual Filing Copilot` template.~~
- [x] ~~Added a first-class `brsr_annual_report` report type.~~
- [x] ~~Designed a calmer SaaS-style workspace shell for EnovAIt.~~
- [x] ~~Added shared Gemma support through an OpenAI-compatible endpoint.~~
- [x] ~~Added real document ingestion for PDFs, spreadsheets, and text evidence.~~
- [x] ~~Verified backend and UI builds.~~

## Still Pending

- [ ] Connect EnovAIt to the Hetzner server as a separate deployment.
- [ ] Point EnovAIt at the shared Gemma endpoint in production.
- [ ] Make login and signup reliable end to end in the production stack.
- [ ] Add a BRSR readiness screen with clear section and principle status.
- [ ] Expand intake paths beyond file upload into email, WhatsApp, and web capture.
- [ ] Seed a convincing Rustomjee-style demo workspace with live ingested evidence instead of fake records.
- [ ] Remove or hide anything that looks like a developer console.
- [ ] Confirm branding, subscription pricing, and product copy are normie-friendly.

## 2-Day Execution Plan

### Day 1

1. Finish deployment wiring on the Hetzner box.
2. Point EnovAIt to the shared Gemma service.
3. Stabilize auth and make sure the UI opens cleanly into the workspace.
4. Use live file ingestion to create the first BRSR evidence records.

### Day 2

1. Build the BRSR readiness and filing views.
2. Add intake paths that feel like WhatsApp/email/web capture.
3. Polish subscription messaging and product positioning.
4. Run a full demo rehearsal and remove anything brittle.

## Demo Story

The demo should answer three questions quickly:

1. Can EnovAIt collect messy BRSR inputs from normal teams?
2. Can it turn that into filing-ready structure and evidence?
3. Can it tell leadership what is still missing before the filing deadline?

## Product Flow

This is the enterprise operating loop we are building:

1. Teams send daily or weekly ESG data through WhatsApp, email, uploaded files, and connected systems.
2. EnovAIt ingests that data automatically and converts it into structured evidence records.
3. AI flags missing disclosures, weak proof, anomalies, and potential audit leaks before the auditor sees them.
4. Human owners review exceptions instead of manually typing every disclosure.
5. Leadership sees a live ESG readiness view mid-week, not just at quarter-end.
6. The system keeps a traceable approval and evidence trail for audit and assurance.

## Implementation Order

### Phase 1 - Ingestion First

1. Real WhatsApp ingestion with webhook-based message and media capture.
2. Email ingestion for policy docs, proofs, and forwarded evidence.
3. File upload ingestion for PDFs, spreadsheets, and text evidence.
4. Route every ingestion into the same evidence record and workflow trail.

### Phase 2 - Reviewer Workflows

1. Reviewer queue for humans to approve, reject, or request more evidence.
2. Ownership routing so the right team gets each missing item.
3. Follow-up reminders for overdue or incomplete disclosures.

### Phase 3 - Leak Detection

1. Section-level BRSR readiness scoring.
2. Missing proof detection.
3. Value-chain and assurance gap alerts.
4. Mid-week executive pulse view.

### Phase 4 - Audit Pack

1. Evidence bundle export.
2. Audit trail timeline.
3. Filing-ready report generation.
4. Reviewer sign-off history.

## Demo Definition Of Done

- The app loads without dev-only friction.
- Login works against the production stack.
- The workspace looks like a subscription SaaS product.
- The BRSR flow feels guided and understandable.
- The customer can see how evidence turns into a report.
- WhatsApp, email, and file ingestion all feed the same live evidence pipeline.
- Reviewers can approve or escalate exceptions without retyping the data.
- The readiness view highlights leaks before the audit cycle closes.
