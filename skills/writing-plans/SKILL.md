---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

# Writing Plans

## Overview

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything they need to know: which files to touch for each task, code, testing, docs they might need to check, how to test it, and exactly how to keep moving autonomously. Give them the whole plan as bite-sized tasks. DRY. YAGNI. TDD. Frequent commits.

Assume they are a skilled developer, but know almost nothing about our toolset or problem domain. Assume they don't know good test design very well. Also assume they may be an autonomous worker executing without a human available for intermediate decisions, so every task needs explicit ownership, safe next steps, validation evidence, and true-blocker criteria.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Context:** If working in an isolated worktree, it should have been created via the `superpowers:using-git-worktrees` skill at execution time.

**Save plans to:** `docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md`
- (User preferences for plan location override this default)

## Scope Check

If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. If it wasn't, suggest breaking this into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

If you can safely continue planning without an answer, do so. Capture assumptions in the plan and add validation steps that prove or disprove them. Stop for clarification only when a **true blocker** prevents a correct plan: mutually exclusive requirements, missing required credentials/data, an unsafe/destructive action, or an unknowable business decision that would change the implementation target.

## File Structure

Before defining tasks, map out which files will be created or modified and what each one is responsible for. This is where decomposition decisions get locked in.

- Design units with clear boundaries and well-defined interfaces. Each file should have one clear responsibility.
- You reason best about code you can hold in context at once, and your edits are more reliable when files are focused. Prefer smaller, focused files over large ones that do too much.
- Files that change together should live together. Split by responsibility, not by technical layer.
- In existing codebases, follow established patterns. If the codebase uses large files, don't unilaterally restructure - but if a file you're modifying has grown unwieldy, including a split in the plan is reasonable.

This structure informs the task decomposition. Each task should produce self-contained changes that make sense independently.

## Autonomous Execution Requirements

Plans must be executable without human checkpoints between steps. Before writing tasks, decide and document:

- **Ownership:** which agent/worker owns each task or file slice, including any disjoint parallel work and the files each worker may edit.
- **Autonomous sequence:** exact commands and decision rules for continuing after each step, including safe fallback steps when a command fails.
- **Validation evidence:** the specific test, lint, typecheck, build, smoke test, diff, or log output that proves each requirement is done.
- **Blockers:** what counts as a true blocker, what evidence proves it, and the closest safe validation the worker should run before reporting it.
- **Integration:** how completed work is gathered, reviewed, reduced into a final result, and checked for conflicts.

Do not write steps that say "ask the user", "wait for approval", or "confirm before continuing" unless the plan has reached a true blocker or safety gate. Prefer "continue with the documented safe default, record the assumption, and validate it".

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the failing test" - step
- "Run it to make sure it fails" - step
- "Implement the minimal code to make the test pass" - step
- "Run the tests and make sure they pass" - step
- "Commit" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

**Ownership:** [Who owns each task/file slice; note any disjoint parallel work and integration owner]

**Autonomous Execution:** [How the implementer proceeds without human checkpoints; include safe defaults and when to continue]

**Validation Evidence:** [Commands, test names, expected outputs, artifacts, and final proof required]

**True Blockers:** [Exact conditions that require stopping, evidence to collect, and closest safe validation to run first]

---
```

## Task Structure

````markdown
### Task N: [Component Name]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"
If it fails differently, inspect the error, update the test only if the expectation is wrong for this codebase, and continue when the next safe step is still clear. Stop only for a true blocker.

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS
Record validation evidence: passing command, relevant output lines, or the exact failure if it exposes a true blocker.

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```

- [ ] **Step 6: Update task evidence**

Record: changed files, tests run, PASS/FAIL result, remaining risks, and whether any blocker criteria were met.
````

## No Placeholders

Every step must contain the actual content an engineer needs. These are **plan failures** — never write them:
- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" / "add validation" / "handle edge cases"
- "Write tests for the above" (without actual test code)
- "Similar to Task N" (repeat the code — the engineer may be reading tasks out of order)
- Steps that describe what to do without showing how (code blocks required for code steps)
- References to types, functions, or methods not defined in any task
- Human checkpoints such as "ask before continuing" when a safe autonomous next step exists
- Missing ownership, validation evidence, or true-blocker criteria

## Remember
- Exact file paths always
- Complete code in every step — if a step changes code, show the code
- Exact commands with expected output
- Exact autonomous continuation rules: what to do next, what evidence to collect, and when a failure is truly blocking
- DRY, YAGNI, TDD, frequent commits

## Self-Review

After writing the complete plan, look at the spec with fresh eyes and check the plan against it. This is a checklist you run yourself — not a subagent dispatch.

**1. Spec coverage:** Skim each section/requirement in the spec. Can you point to a task that implements it? List any gaps.

**2. Placeholder scan:** Search your plan for red flags — any of the patterns from the "No Placeholders" section above. Fix them.

**3. Type consistency:** Do the types, method signatures, and property names you used in later tasks match what you defined in earlier tasks? A function called `clearLayers()` in Task 3 but `clearFullLayers()` in Task 7 is a bug.

**4. Autonomy check:** Does every task say who owns it, the exact safe next step, the validation evidence to capture, and the true-blocker conditions? Remove unnecessary human checkpoints.

If you find issues, fix them inline. No need to re-review — just fix and move on. If you find a spec requirement with no task, add the task.

## Execution Handoff

After saving the plan, proceed according to the user's requested scope without adding a human checkpoint:

- If the user asked only for a plan, report the saved path and summarize autonomous execution/validation requirements.
- If the user asked for implementation or the next step is obvious, start execution using the best available execution skill.
- If subagents are available and tasks are independent, prefer subagent-driven development; otherwise execute inline with executing-plans.
- If a true blocker exists, report the blocker, evidence collected, and the closest safe validation already run.

**Autonomous completion message:**

**"Plan complete and saved to `docs/superpowers/plans/<filename>.md`. It includes ownership, autonomous execution steps, validation evidence, and true-blocker criteria. [If implementation was requested: I am proceeding with <subagent-driven-development|executing-plans> now.]"**

**If Subagent-Driven chosen:**
- **REQUIRED SUB-SKILL:** Use superpowers:subagent-driven-development
- Fresh subagent per task + two-stage review
- Dispatch independent tasks in parallel, gather each worker's evidence, reduce the results, and run final integration validation.

**If Inline Execution chosen:**
- **REQUIRED SUB-SKILL:** Use superpowers:executing-plans
- Execute safe steps continuously; checkpoint only at true blockers or required safety gates.
