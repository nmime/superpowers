---
name: requesting-code-review
description: Use when completing tasks, implementing major features, or before merging to verify work meets requirements
---

# Requesting Code Review

Dispatch a code reviewer subagent to catch issues before they cascade. The reviewer gets precisely crafted context for evaluation — never your session's history. This keeps the reviewer focused on the work product, not your thought process, and preserves your own context for continued work.

Reviews are autonomous by default. Give the reviewer enough boundaries to work safely, then expect them to inspect the diff, touched files, nearby code, and relevant tests on their own. They should ask questions only when a true blocker prevents a defensible review.

**Core principle:** Review early, review often.

## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing major feature
- Before merge to main

**Optional but valuable:**
- When stuck (fresh perspective)
- Before refactoring (baseline check)
- After fixing complex bug

## How to Request

**1. Get git SHAs:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Dispatch code reviewer subagent:**

Use Task tool with `general-purpose` type, fill template at `code-reviewer.md`

**Placeholders:**
- `{DESCRIPTION}` - Brief summary of what you built
- `{PLAN_OR_REQUIREMENTS}` - What it should do
- `{BASE_SHA}` - Starting commit
- `{HEAD_SHA}` - Ending commit

**3. Act on feedback:**
- Verify each finding against the code before changing anything
- Fix Critical issues immediately
- Fix Important issues before proceeding
- Note Minor issues for later
- Push back if reviewer is wrong (with code/test evidence)
- Ask your human partner only for true blockers or risk decisions you cannot safely resolve

## Autonomous Review Expectations

The reviewer should not need routine clarification. Your prompt should make clear that they own the investigation inside the supplied repository and git range.

**Reviewer must independently:**
- Run `git diff --stat` and `git diff` for the supplied range
- Read changed files plus surrounding code needed to understand behavior
- Inspect relevant tests, fixtures, scripts, and CI/package commands when available
- Verify claims against code, tests, documentation, or command output before reporting them
- Identify actionable findings with file:line evidence and concrete impact
- Distinguish confirmed issues from unverified risks or optional improvements

**Reviewer may ask only for true blockers:**
- Required files, SHAs, or requirements are missing or inaccessible
- The repository cannot be inspected after a real attempt
- Validation requires credentials, external systems, destructive actions, or product decisions outside the prompt
- A finding depends on business intent that cannot be inferred from requirements or code

**Reviewer should not ask for:**
- A summary of the diff they can inspect
- File contents available in the repository
- Permission to run safe read-only inspection commands
- Clarification before making reasonable assumptions and stating them

## Autonomous Parent Handling

After review, keep ownership of the work:
- Reproduce or inspect each finding before accepting it
- Apply straightforward fixes without asking for permission
- Re-run targeted validation for each fix and broader relevant checks before proceeding
- Route architectural, product, security, data-loss, or scope-risk decisions to your human partner only when evidence shows the decision cannot be made safely from the repo and requirements
- Record rejected findings with the code/test evidence that disproves them

## Example

```
[Just completed Task 2: Add verification function]

You: Let me request code review before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 1" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Dispatch code reviewer subagent]
  DESCRIPTION: Added verifyIndex() and repairIndex() with 4 issue types
  PLAN_OR_REQUIREMENTS: Task 2 from docs/superpowers/plans/deployment-plan.md
  BASE_SHA: a7981ec
  HEAD_SHA: 3df7661

[Subagent returns]:
  Strengths: Clean architecture, real tests
  Issues:
    Important: Missing progress indicators
    Minor: Magic number (100) for reporting interval
  Assessment: Ready to proceed

You: [Fix progress indicators]
[Continue to Task 3]
```

## Integration with Workflows

**Subagent-Driven Development:**
- Review after EACH task
- Catch issues before they compound
- Fix before moving to next task

**Executing Plans:**
- Review after each task or at natural checkpoints
- Get feedback, apply, continue

**Ad-Hoc Development:**
- Review before merge
- Review when stuck

## Red Flags

**Never:**
- Skip review because "it's simple"
- Ignore Critical issues
- Proceed with unfixed Important issues
- Argue with valid technical feedback

**If reviewer wrong:**
- Push back with technical reasoning
- Show code/tests that prove it works
- Request clarification only for true blockers or risk decisions

See template at: requesting-code-review/code-reviewer.md
