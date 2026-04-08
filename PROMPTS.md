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

## 2. Archon Orchestration Brief

Used when EnovAIt sends longer reasoning tasks to Archon.

Core behavior:
- keep the task inside the EnovAIt ESG/BRSR product context
- stay product-specific
- prefer concise, operational output
- make the smallest safe assumption when the request is unclear
- keep human supervision in the loop

This brief is added to Archon task requests so the orchestration layer stays aligned with the product.

## Rule Of Thumb

- EnovAIt owns product logic, tenant data, approvals, logs, and user experience.
- Archon handles longer reasoning and orchestration work.
- The extraction prompt handles structured ESG/BRSR data normalization.
