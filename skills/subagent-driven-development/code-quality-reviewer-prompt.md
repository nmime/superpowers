# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer subagent.

**Purpose:** Verify implementation is well-built (clean, tested, maintainable)

**Only dispatch after spec compliance review passes. Do not proceed on routine uncertainty; ask only for true blockers or unsafe ambiguity.**

```
Task tool (general-purpose):
  Use template at requesting-code-review/code-reviewer.md

  DESCRIPTION: [task summary, from implementer's report]
  PLAN_OR_REQUIREMENTS: Task N from [plan-file]
  BASE_SHA: [commit before task]
  HEAD_SHA: [current commit]
  CHANGED_FILES: [exact changed files from implementer's report]
  VALIDATION: [commands/results from implementer's report]
  ASSUMPTIONS: [bounded assumptions from implementer's report]
```

**In addition to standard code quality concerns, the reviewer should autonomously inspect the changed files and check:**
- Does each file have one clear responsibility with a well-defined interface?
- Are units decomposed so they can be understood and tested independently?
- Is the implementation following the file structure from the plan?
- Did this implementation create new files that are already large, or significantly grow existing files? (Don't flag pre-existing file sizes — focus on what this change contributed.)
- Are target/SHA, changed files, tests, and validation evidence present and plausible?
- Are any assumptions unsafe, unvalidated, or likely to hide defects?

**Code reviewer returns:** Strengths, Issues (Critical/Important/Minor), Assessment, Evidence checked (target/SHA, changed files, validation), and True blockers if review cannot proceed safely.
