# BRSR Agentic Product Blueprint

This document reverse engineers `BRSR_2025.pdf` into an India-first EnovAIt product.

## What the PDF tells us

The uploaded BRSR document is not just an annual report. It is an operating structure with:

- `Section A`: general disclosures about the listed entity, operations, workforce, subsidiaries, CSR, complaints, and material issues
- `Section B`: policy and management process disclosures across `Principle 1` to `Principle 9`
- `Section C`: principle-wise performance disclosures with both `Essential Indicators` and `Leadership Indicators`

The sample filing also reveals the practical data shape behind BRSR:

- entity metadata and reporting boundary
- complaints and grievance counts by stakeholder group
- material issue registers with `risk` or `opportunity`
- policy coverage, board approval, value-chain extension, and standards mapping
- principle-specific metrics like training coverage, sourcing, worker well-being, energy, water, emissions, waste, privacy, and value-chain awareness
- narrative disclosures tied to evidence, not just KPI tables

## Product thesis

EnovAIt should not behave like a generic ESG dashboard for consultants. It should behave like a multi-channel BRSR copilot for Indian enterprises.

That means:

- normal users talk in plain language on channels they already use
- the platform converts fragmented evidence into BRSR-ready structured records
- agents chase missing fields, owners, evidence, and approvals automatically
- sustainability teams review a readiness layer instead of manually assembling disclosures from scratch

## India-first multi-channel workflow

### 1. Intake channels

The product should accept BRSR inputs from:

- WhatsApp for plant, HR, EHS, procurement, and site teams
- email for policy docs, grievance logs, and auditor requests
- web app for ESG and compliance teams
- ERP and partner APIs for finance, procurement, and vendor data

### 2. Agent jobs

The agent layer should be split into operational jobs:

- `entity profiler`: collects Section A identity, boundary, and operational disclosures
- `materiality mapper`: converts raw risks and opportunities into the BRSR material issue format
- `principle copilot`: handles each of P1 to P9 separately
- `evidence chaser`: asks for missing proofs, links, files, owners, and dates
- `assurance monitor`: flags unassured or weakly supported disclosures
- `value-chain follow-up agent`: gathers supplier and partner disclosures
- `report composer`: assembles the annual BRSR narrative and data snapshot

### 3. User experience

Normies should see:

- "Tell me what happened"
- "Upload proof"
- "Who should confirm this?"
- "What is still missing before filing?"

They should not see:

- JSON schema
- orchestration jargon
- model/provider configuration
- framework plumbing

## Core product objects

EnovAIt should treat these as first-class records:

- `brsr_section_a_general_disclosure`
- `brsr_section_b_management_disclosure`
- `brsr_material_issue`
- `brsr_principle_1` through `brsr_principle_9`
- `brsr_evidence_bundle`
- `brsr_assurance_gap`
- `brsr_value_chain_followup`

## Readiness model

The platform should continuously answer:

- which BRSR sections are complete
- which principles are still weak
- which numbers have no evidence
- which disclosures are narrative-only and still need metrics
- which value-chain statements are unsupported
- which items are ready for assurance review

## What has now been encoded in the repo

- a `BRSR India` module in seed data
- a `BRSR India Annual Filing Copilot` template
- a first-class `brsr_annual_report` report type
- BRSR readiness workflows for assurance and value-chain gaps

## Recommended next implementation steps

1. Add file ingestion for annual reports, policy PDFs, and evidence packs.
2. Add channel-specific ingestion workers for WhatsApp, email, and ERP.
3. Persist evidence references separately from narrative extracted data.
4. Build a BRSR readiness page with section and principle completion states.
5. Add streaming review drafts so ESG teams can approve narratives in plain language.
