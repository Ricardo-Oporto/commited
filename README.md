# Commit Message Assistant VS Code Extension

## Purpose

This starter project captures the vision, feasibility, and execution plan for building a bespoke VS Code extension that generates rich commit messages. The extension will:

- Inspect staged Git changes from the Source Control view.
- Construct a conventional-commit style title prefixed with the current branch key (`TASK-<branch>`).
- Generate an explanatory body that summarises the change, rationale, and impact, delegating the narrative to GitHub Copilot by default with a deterministic fallback.
- Let the developer review/edit the message in the SCM input (no silent commits).
- Optionally allow one-click commits after confirmation.

## Use this document as the single source of truth when you resume the work.

## Feasibility Snapshot

| Concern                   | Notes                                                                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Branch-aware messages** | VS Code’s Git extension API exposes `repository.state.HEAD?.name`, so prefixing with `TASK-<branch>` is straightforward.                     |
| **Diff inspection**       | Use `repository.diff` or read `repository.getStagedChanges()` to gather paths and status codes. This matches the current script’s behaviour. |
| **Source Control UI**     | Set `repository.inputBox.value` to prefill the commit message. Add a quick pick or progress notification for confirmation before committing. |
| **Copilot narrative**     | Use the Copilot Chat API to produce the commit body; fall back to deterministic templates if Copilot is unavailable or disabled.             |

Result: **Fully feasible.**

---

## Project Layout (target)

```
commit_extension/
├─ package.json              # Extension manifest scaffold (TBD)
├─ tsconfig.json             # TypeScript config (TBD)
├─ src/
│  ├─ extension.ts           # Activation logic
│  └─ commit-message/
│     ├─ generator.ts        # Deterministic message builder utilities
│     └─ templates.ts        # String helpers & heuristics
├─ media/                    # Future assets (badges/icons)
├─ .vscode/
│  └─ launch.json            # Extension host launch config (TBD)
├─ README.md                 # Vision & plan (this file)
└─ docs/
   └─ architecture.md        # Optional deeper dive once coding starts
```

Only the README is committed now; scaffold files will be added in **Phase 2** (see roadmap).

---

## Execution Roadmap

### Phase 1 – Foundations (you are here)

- ✅ Capture feasibility + scope (this README).
- ☑ Decide on language/runtime (TypeScript recommended for VS Code extensions).

### Phase 2 – Skeleton Extension

1. ☑ Initialize extension scaffold manually to match the TypeScript plan.
2. Clean up generated README, wiring it to this plan.
3. Add basic activation that logs "Commit Assistant activated".

### Phase 3 – Git API integration

1. Import `const git = extensions.getExtension('vscode.git')?.exports.getAPI(1);`.
2. Grab the active repository (`git.repositories[0]`).
3. Expose a command `commitAssistant.generateMessage` that:
   - Validates staged changes.
   - Reads `repo.state.HEAD?.name`.
   - Enumerates `repo.state.indexChanges` for file paths + statuses.

### Phase 4 – Copilot narrative integration

1. Add a command `commitAssistant.generateMessageWithCopilot` that requests output from the Copilot Chat API.
2. Pass branch metadata, staged change summaries, and developer-configured hints into the Copilot prompt.
3. Populate the SCM input box with Copilot’s response; retain deterministic output as a fallback when the AI is unavailable.
4. Provide settings for opt-in/opt-out and Copilot prompt tuning (`commitAssistant.copilot.*`).

### Phase 5 – Deterministic fallback builder

1. Copy across the deterministic helpers from the current Node script.
2. Convert to TypeScript: define types (`ChangeInfo`, `Narrative` etc.) and ensure no Node-only globals.
3. Unit test builder functions using `vitest` or `mocha`.

### Phase 6 – Source Control experience

1. Prefill `repo.inputBox.value` with the generated message.
2. Show a `window.showInformationMessage` preview and ask for confirmation.
3. If the user confirms a "Commit now" action, call `repo.commit(message, { all: false })`.
4. Add graceful failure handling (no staged files, detached HEAD, etc.).

### Phase 7 – Configuration & polish

- Settings schema (e.g. `commitAssistant.includeImpactSection`, `commitAssistant.branchPrefixPattern`).
- Status bar item when staged changes exist to run the command quickly.
- Telemetry off by default (document if you add it).
- Prepare docs in `docs/architecture.md` capturing flows + diagrams.

### Phase 8 – Packaging & Release

1. Run `npm run package` (vsce) to build `.vsix`.
2. Test install locally.
3. Publish or share internally.

---

## Suggested Worklog Template

When you pick this up, keep a `docs/worklog.md` noting:

- Date & focus area.
- Commands executed (scaffolding, tests, packaging).
- Open questions.
- Next actions.

---

## Open Questions to Resolve Later

1. **CI integration?** – Do you want GitHub Actions to package + test automatically?
2. **Copilot-first narrative** – Default to GitHub Copilot for the commit body while keeping the deterministic generator as a fallback; revisit Azure/OpenAI options only if Copilot access is unavailable.
3. **Multi-repo support?** – If multiple repos are open, how should the command choose?
4. **Localization?** – English only for now, but consider future localisation hooks.
5. **User prompts** – Keep inline with accessibility best practices (keyboard friendly with quick pick or message actions).

---

## Helpful References

- VS Code Extension Essentials: https://code.visualstudio.com/api
- Git Extension API: https://code.visualstudio.com/api/extension-guides/scm-provider
- Copilot Chat API (for possible integration): https://aka.ms/copilot-chat-extensions
- Conventional Commits: https://www.conventionalcommits.org/en/v1.0.0/

---

## Next Step Checklist

- [ ] Run the VS Code extension generator (`npm create @vscode/ext@latest`).
- [ ] Port message builder utilities into `src/commit-message`.
- [ ] Wire up Git API command to populate the SCM input box.
- [ ] Prototype the Copilot-powered narrative command and settings.
- [ ] Document decisions in `docs/architecture.md`.

Once these are complete, you’ll have a functional MVP ready for refinement.
