# EnovAIt Prompts

This repo uses two prompt layers:

## 1. ESG / BRSR Extraction Prompt

Used when EnovAIt turns messages, uploads, or reviewer notes into structured evidence.

Core behavior:
- stay conservative
- never invent values
- ask for clarification when needed
- preserve evidence, units, and template structure
- return schema-compliant output only

This prompt is used by the extraction providers in the backend.

## Rule Of Thumb

- EnovAIt owns product logic, tenant data, approvals, logs, and user experience.
- The extraction prompt handles structured ESG/BRSR data normalization.
