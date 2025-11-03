# Commit Message Assistant Architecture

## High-Level Overview

- **Extension Host Integration**: `src/extension.ts` activates via the `commitAssistant.generateMessage` command. It retrieves the primary Git repository from the built-in Git extension, gathers staged changes, and orchestrates commit message generation.
- **Message Generation Pipeline**: `src/commit-message/generator.ts` converts repository metadata into a deterministic commit message, delegating formatting heuristics to `src/commit-message/templates.ts`.
- **Configuration Surface**: User settings under the `commitAssistant` namespace control branch prefix formatting and whether to include an Impact section in generated messages.

## Planned Enhancements

1. **Diff Analysis** – Enrich change summaries with hunk-level insights to describe rationale in greater detail.
2. **AI Augmentation** – Optional command to call an LLM endpoint for narrative refinement while keeping deterministic defaults.
3. **Status Bar Entry** – Quick access trigger once staged changes are detected, echoing the Source Control workflow.
4. **Testing Strategy** – Introduce Vitest suites for the message generator and any future utility modules.

## Open Questions

- How should multiple Git repositories be prioritised when present? Current implementation selects the first repository exposed by the Git API.
- Should the extension infer conventional commit types automatically or rely on a default type? The current implementation hardcodes `feat` for clarity.
- What telemetry, if any, is acceptable for future analytics without compromising privacy expectations?
