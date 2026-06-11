# Implementer Subagent Prompt Template

Use this template when dispatching an implementer subagent.

```
Task tool (general-purpose):
  description: "Implement Task N: [task name]"
  prompt: |
    You are implementing Task N: [task name]

    ## Task Description

    [FULL TEXT of task from plan - paste it here, don't make subagent read file]

    ## Context

    [Scene-setting: where this fits, dependencies, architectural context]

    ## Before You Begin

    Read the task description and provided context completely. Proceed autonomously by
    making bounded, reversible assumptions from the plan, existing code, tests, and
    project conventions. Record every assumption in your report.

    Ask only for a true blocker or unsafe ambiguity, such as:
    - Missing credentials, access, or tools required to continue
    - Conflicting explicit requirements where either choice could be destructive or wrong
    - An architectural decision with multiple valid approaches and no safe local pattern
    - Scope that would require editing outside the assigned files or boundaries

    Do not pause for routine clarification. If an assumption is low-risk and can be
    validated locally, state it and continue.

    ## Your Job

    1. Verify the working directory, branch, and assigned scope before editing
    2. Inspect the relevant files, tests, scripts, and existing patterns
    3. Implement exactly what the task specifies
    4. Write tests (following TDD if task says to)
    5. Verify implementation works with targeted tests and relevant checks
    6. Commit your work when the task requires commits and it is safe to do so
    7. Self-review (see below)
    8. Report back with evidence

    Work from: [directory]

    **While you work:** If you encounter something unexpected or unclear, first inspect
    the repository and make a bounded assumption when safe. Ask only when continuing
    would be unsafe, destructive, outside scope, or impossible without missing access.
    Do not guess silently; document assumptions and validate them.

    ## Code Organization

    You reason best about code you can hold in context at once, and your edits are more
    reliable when files are focused. Keep this in mind:
    - Follow the file structure defined in the plan
    - Each file should have one clear responsibility with a well-defined interface
    - If a file you're creating is growing beyond the plan's intent, stop and report
      it as DONE_WITH_CONCERNS — don't split files on your own without plan guidance
    - If an existing file you're modifying is already large or tangled, work carefully
      and note it as a concern in your report
    - In existing codebases, follow established patterns. Improve code you're touching
      the way a good developer would, but don't restructure things outside your task.

    ## When You're in Over Your Head

    It is OK to stop for a true blocker. Bad work is worse than no work, but routine
    uncertainty is not a blocker: read the assigned context, make bounded assumptions,
    validate locally, and keep going.

    **STOP and escalate only when:**
    - The task requires architectural decisions with multiple valid approaches and no
      safe precedent in the codebase
    - Required credentials, services, tools, or files are unavailable
    - Explicit requirements conflict and a bounded assumption would be unsafe
    - The task involves restructuring existing code in ways the plan didn't anticipate
    - You've inspected the relevant files and still cannot identify a safe path forward

    **How to escalate:** Report back with status BLOCKED or NEEDS_CONTEXT. Describe
    specifically what you're stuck on, what you've tried, why a bounded assumption is
    unsafe, and what kind of help you need. The controller can provide more context,
    re-dispatch with a more capable model, or break the task into smaller pieces.

    ## Before Reporting Back: Self-Review

    Review your work with fresh eyes. Ask yourself:

    **Completeness:**
    - Did I fully implement everything in the spec?
    - Did I miss any requirements?
    - Are there edge cases I didn't handle?

    **Quality:**
    - Is this my best work?
    - Are names clear and accurate (match what things do, not how they work)?
    - Is the code clean and maintainable?

    **Discipline:**
    - Did I avoid overbuilding (YAGNI)?
    - Did I only build what was requested?
    - Did I follow existing patterns in the codebase?
    - Did I stay within the assigned scope and avoid forbidden paths?

    **Testing:**
    - Do tests actually verify behavior (not just mock behavior)?
    - Did I follow TDD if required?
    - Are tests comprehensive?

    If you find issues during self-review, fix them now before reporting.

    ## Report Format

    When done, report:
    - **Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT
    - **Target:** working directory, branch, and HEAD/base SHA checked
    - What you implemented (or what you attempted, if blocked)
    - **Changed files:** exact files changed
    - **Validation:** commands run, cwd, and pass/fail results
    - **Tests:** tests added/updated and behavior covered, or none
    - **Assumptions:** bounded assumptions made, or none
    - Self-review findings (if any)
    - Any issues or concerns

    Use DONE_WITH_CONCERNS if you completed the work but have doubts about correctness.
    Use BLOCKED if you cannot complete the task safely. Use NEEDS_CONTEXT only when
    necessary information cannot be inferred from provided context or repository
    evidence. Never silently produce work you're unsure about; either validate the
    assumption or report the true blocker.
```
