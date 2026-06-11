---
name: executing-plans
description: Use when you have a written implementation plan to execute autonomously in a separate session
---

# Executing Plans

## Overview

Load plan, review critically, execute all safe tasks autonomously, gather validation evidence, and report when complete or truly blocked.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

**Note:** Superpowers works much better with access to subagents. If subagents are available and the plan has independent tasks, use superpowers:subagent-driven-development instead of this skill. Do not stop merely to ask which mode to use; choose the best available safe mode and continue.

## The Process

### Step 1: Load and Review Plan
1. Read plan file
2. Review critically - identify questions, risks, safety gates, validation commands, ownership boundaries, and true-blocker criteria
3. If the plan has a non-blocking gap, make the smallest safe assumption, record it in your task notes, and continue with the next safe step
4. If the plan has a critical gap that is a true blocker, collect evidence, run the closest safe validation, and report the blocker
5. If no true blocker exists: Create TodoWrite and proceed

### Step 2: Execute Tasks

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Continue through safe next steps without human checkpoints; do not pause for approval when the plan, repository state, and safety gates make the next action clear
4. Run verifications as specified, capture validation evidence, and group any failures by file/project/error class
5. If verification fails, inspect the failure and take the next safe corrective step within the plan's ownership boundary; rerun the targeted verification
6. Mark as completed only when implementation and required validation evidence are complete, or mark as blocked with true-blocker evidence

### Step 3: Complete Development

After all tasks complete and verified:
- Announce: "I'm using the finishing-a-development-branch skill to complete this work."
- **REQUIRED SUB-SKILL:** Use superpowers:finishing-a-development-branch
- Follow that skill to verify tests and finish according to the user's requested scope. Continue through safe finishing steps; stop only at required safety gates or true blockers.

## True Blockers and Safe Continuation

**A true blocker is one of:**
- Missing credentials, services, hardware, paid resources, or protected data required to proceed
- Ambiguous or conflicting requirements where choosing would likely build the wrong thing
- A safety gate: destructive action, deployment, schema/data migration, merge/push, or external side effect not explicitly authorized
- Repository state mismatch, ownership conflict, or edits required outside the assigned scope
- Repeated validation failure after targeted debugging where the next corrective step is not safe or not knowable

**Do not stop for non-blockers:**
- A failing test with a clear error and an in-scope fix
- A missing dependency that can be installed safely in the local/dev environment
- A plan typo where the intended file, command, or symbol is obvious from context
- A validation command that needs an equivalent local variant because of the current environment

When blocked, report the exact blocker, evidence collected, commands run, and the closest safe validation result. Otherwise, continue autonomously.

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through true blockers** - stop, report evidence, and ask only for the missing decision or authorization.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Continue through safe steps without human checkpoints; stop only for true blockers
- Capture validation evidence for every completed task
- Never start implementation on main/master branch without explicit user consent

## Integration

**Required workflow skills:**
- **superpowers:using-git-worktrees** - Ensures isolated workspace (creates one or verifies existing)
- **superpowers:writing-plans** - Creates the plan this skill executes
- **superpowers:finishing-a-development-branch** - Complete development after all tasks
