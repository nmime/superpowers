---
name: finishing-a-development-branch
description: Use when implementation is complete and you need to verify, report, or explicitly integrate the work - autonomously runs final checks and preserves gates for merge, PR, push, destructive cleanup, or deploy
---

# Finishing a Development Branch

## Overview

Guide completion of development work by verifying the target, running final checks, reporting results, and handling an explicitly chosen integration workflow.

**Core principle:** Prove target → Verify tests → Detect environment → Report completion or execute explicitly assigned action → Clean up only when authorized.

**Announce at start:** "I'm using the finishing-a-development-branch skill to complete this work."

## The Process

### Step 0: Prove Target and Scope

Before final verification, commits, pushes, merges, cleanup, or deployment, prove that the working copy matches the assigned target repo/path/branch/SHA and that only assigned files changed.

Recommended proof commands:

```bash
printf 'repo=%s\n' "$(git remote get-url origin 2>/dev/null || true)"
printf 'root=%s\n' "$(git rev-parse --show-toplevel 2>/dev/null || true)"
printf 'branch=%s\n' "$(git branch --show-current 2>/dev/null || true)"
printf 'head=%s\n' "$(git rev-parse HEAD 2>/dev/null || true)"
git status --short
git diff --name-only HEAD
```

If the target repo/path/branch/SHA does not match, stop and report the mismatch. If changed files include paths outside the assigned scope, stop before committing/pushing and report them.

**Authorization gates:** final verification and reporting are autonomous. Commit only when assigned. Push, merge, force-push, branch deletion, worktree removal, discard/reset, deploy, and release publication require explicit assignment or the typed confirmations below.

### Step 1: Verify Tests

**Before presenting options, verify tests pass:**

```bash
# Run project's test suite
npm test / cargo test / pytest / go test ./...
```

**If tests fail:**
```
Tests failing (<N> failures). Must fix before completing:

[Show failures]

Cannot proceed with merge/PR until tests pass.
```

Stop before merge/PR/push/deploy. If the assigned task is only to report final status, continue to Step 4 with a blocked verification report.

**If tests pass:** Continue to Step 2.

### Step 2: Detect Environment

**Determine workspace state before presenting options:**

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
```

This determines which menu to show and how cleanup works:

| State | Menu | Cleanup |
|-------|------|---------|
| `GIT_DIR == GIT_COMMON` (normal repo) | Standard 4 options | No worktree to clean up |
| `GIT_DIR != GIT_COMMON`, named branch | Standard 4 options | Provenance-based (see Step 6) |
| `GIT_DIR != GIT_COMMON`, detached HEAD | Reduced 3 options (no merge) | No cleanup (externally managed) |

### Step 3: Determine Base Branch

```bash
# Try common base branches
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

Or ask: "This branch split from main - is that correct?"

### Step 4: Decide Completion Path

If the assignment only asked for implementation, verification, a commit, or a final report, do not present a menu or pause. Run the relevant final verification, report target proof, changed files, validation, tests, errors, and next step. Keep the branch/worktree as-is.

Present options only when integration/cleanup is not already assigned and the next action requires user choice or authorization.

**Normal repo and named-branch worktree — when a choice is required, present exactly these 4 options:**

```
Implementation complete. What would you like to do?

1. Merge back to <base-branch> locally
2. Push and create a Pull Request
3. Keep the branch as-is (I'll handle it later)
4. Discard this work

Which option?
```

**Detached HEAD — when a choice is required, present exactly these 3 options:**

```
Implementation complete. You're on a detached HEAD (externally managed workspace).

1. Push as new branch and create a Pull Request
2. Keep as-is (I'll handle it later)
3. Discard this work

Which option?
```

**Don't add explanation** - keep options concise. Do not use the menu as a substitute for an assigned autonomous final report.

### Step 5: Execute Choice

#### Assigned Final Report / Keep As-Is

When no merge, PR, push, discard, cleanup, or deploy is explicitly assigned, finish with a concise report and preserve the branch/worktree:

```text
Target proof: <repo/path/branch/SHA>
Changed files: <files>
Validation: <commands and pass/fail results>
Tests: <test files added/updated or none>
Safety gates: no push/merge/deploy/destructive cleanup performed because not assigned
Next: <requested next step or none>
```

#### Option 1: Merge Locally

```bash
# Get main repo root for CWD safety
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"

# Merge first — verify success before removing anything
git checkout <base-branch>
git pull
git merge <feature-branch>

# Verify tests on merged result
<test command>

# Only after merge succeeds: cleanup worktree (Step 6), then delete branch
```

Then: Cleanup worktree (Step 6), then delete branch:

```bash
git branch -d <feature-branch>
```

#### Option 2: Push and Create PR

Only perform this option when the user/parent explicitly assigned push/PR creation or selected this option. Verify the commit to push exists on the assigned branch first.

```bash
# Push branch
git push -u origin <feature-branch>

# Create PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets of what changed>

## Test Plan
- [ ] <verification steps>
EOF
)"
```

**Do NOT clean up worktree** — user needs it alive to iterate on PR feedback.

#### Option 3: Keep As-Is

Report: "Keeping branch <name>. Worktree preserved at <path>."

**Don't cleanup worktree.**

#### Option 4: Discard

This is destructive. **Confirm first:**
```
This will permanently delete:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path>

Type 'discard' to confirm.
```

Wait for exact confirmation.

If confirmed:
```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
```

Then: Cleanup worktree (Step 6), then force-delete branch:
```bash
git branch -D <feature-branch>
```

### Step 6: Cleanup Workspace

**Only runs for Options 1 and 4 after explicit authorization.** Options 2, 3, and assigned final-report-only completion always preserve the worktree.

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
WORKTREE_PATH=$(git rev-parse --show-toplevel)
```

**If `GIT_DIR == GIT_COMMON`:** Normal repo, no worktree to clean up. Done.

**If worktree path is under `.worktrees/`, `worktrees/`, or `~/.config/superpowers/worktrees/`:** Superpowers created this worktree — we own cleanup.

```bash
MAIN_ROOT=$(git -C "$(git rev-parse --git-common-dir)/.." rev-parse --show-toplevel)
cd "$MAIN_ROOT"
git worktree remove "$WORKTREE_PATH"
git worktree prune  # Self-healing: clean up any stale registrations
```

**Otherwise:** The host environment (harness) owns this workspace. Do NOT remove it. If your platform provides a workspace-exit tool, use it. Otherwise, leave the workspace in place.

## Quick Reference

| Option | Merge | Push | Keep Worktree | Cleanup Branch |
|--------|-------|------|---------------|----------------|
| 1. Merge locally | yes | - | - | yes |
| 2. Create PR | - | yes | yes | - |
| 3. Keep as-is / final report | - | - | yes | - |
| 4. Discard | - | - | - | yes (force) |

## Common Mistakes

**Skipping test verification**
- **Problem:** Merge broken code, create failing PR
- **Fix:** Always verify tests before offering options

**Unnecessary pauses**
- **Problem:** Asking what to do when the assignment already asked for final verification/report, commit, push, or PR
- **Fix:** Execute the assigned safe action autonomously after target proof; present options only when authorization or choice is missing

**Cleaning up worktree for Option 2**
- **Problem:** Remove worktree user needs for PR iteration
- **Fix:** Only cleanup for Options 1 and 4

**Deleting branch before removing worktree**
- **Problem:** `git branch -d` fails because worktree still references the branch
- **Fix:** Merge first, remove worktree, then delete branch

**Running git worktree remove from inside the worktree**
- **Problem:** Command fails silently when CWD is inside the worktree being removed
- **Fix:** Always `cd` to main repo root before `git worktree remove`

**Cleaning up harness-owned worktrees**
- **Problem:** Removing a worktree the harness created causes phantom state
- **Fix:** Only clean up worktrees under `.worktrees/`, `worktrees/`, or `~/.config/superpowers/worktrees/`

**No confirmation for discard**
- **Problem:** Accidentally delete work
- **Fix:** Require typed "discard" confirmation

## Red Flags

**Never:**
- Proceed with failing tests to merge/PR/push/deploy
- Commit, push, merge, deploy, delete, reset, discard, or clean up without target proof and authorization
- Merge without verifying tests on result
- Delete work without confirmation
- Force-push without explicit request
- Remove a worktree before confirming merge success
- Clean up worktrees you didn't create (provenance check)
- Run `git worktree remove` from inside the worktree

**Always:**
- Prove target and changed-file scope before final actions
- Verify tests before offering options or final report
- Detect environment before presenting menu
- Present exactly 4 options (or 3 for detached HEAD) only when a choice is required
- Get typed confirmation for Option 4
- Clean up worktree for Options 1 & 4 only
- `cd` to main repo root before worktree removal
- Run `git worktree prune` after authorized removal
