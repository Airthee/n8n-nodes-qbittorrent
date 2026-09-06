---
name: pr-feedback
description: Use when working through review feedback on a pull request - reviewer comments, requested changes, unresolved review threads, a PR that needs answering before it can merge.
---

# Processing pull request feedback

## Overview

A review thread is turned into four things: a code change where the feedback is
right, a durable rule where the feedback generalizes, a reply on the thread,
and a resolved state that matches what actually happened.

**Core principle:** a thread is resolved only when the work it asked for is
done. Every other thread gets an answer and stays open - closing a thread you
did not act on takes away the reviewer's ability to insist.

**REQUIRED SUB-SKILL:** superpowers:receiving-code-review - evaluate each item
technically before implementing it.
**REQUIRED SUB-SKILL:** gh-comment - every reply goes through it.

## 1. Collect the threads

```bash
gh api graphql -f query='
query($owner:String!,$repo:String!,$pr:Int!){
  repository(owner:$owner,name:$repo){
    pullRequest(number:$pr){
      reviewThreads(first:100){nodes{
        id isResolved isOutdated path line
        comments(first:50){nodes{author{login} body url}}
      }}
    }
  }
}' -F owner=<owner> -F repo=<repo> -F pr=<n> > "$SCRATCH/threads.json"
```

Use `reviewThreads`, not `gh pr view --comments`: only this query returns the
thread `id`, and without it nothing can be resolved later. Fetch the PR body
comments too (`gh pr view <n> --json comments`) - reviewers often put the real
objection there rather than in a thread.

Skip threads already `isResolved`. An `isOutdated` thread still gets triaged;
the code moved, the point may stand.

Bot reviewers (`coderabbitai` and friends) post bodies thousands of characters
long, with collapsed `<details>` sections holding scripts and full file dumps.
That is why the query goes to a file: read the threads back from disk one at a
time, rather than pulling the whole review into context at once.

One todo per remaining thread. Work them one at a time.

## 2. Triage each thread

Run it through superpowers:receiving-code-review, then label it:

| Label | Meaning |
|---|---|
| **ACCEPT** | Correct for this codebase. Implement it. |
| **REJECT** | Technically wrong here, and you have a reason you would defend out loud. |
| **DEFER** | Valid, but outside this PR's scope. |
| **CLARIFY** | Ambiguous. Stop and ask the user - never implement a guess. |

Unclear items block the batch, they do not get postponed: related items make
partial understanding produce the wrong change.

## 3. Apply the accepted changes

One item at a time, test between each, following the repository's normal
workflow. Do not batch several reviewers' suggestions into one edit - when a
test breaks you will not know which one broke it.

Ask which branch the work goes on before committing.

## 4. Generalize - the step that gets skipped

For each ACCEPT, ask one question: **would this comment be just as right on
another file, in another PR?** If no, say "not generalizable" out loud and move
on. If yes, place the rule:

| Nature of the rule | Where it goes |
|---|---|
| Mechanically checkable - formatting, a forbidden API, naming, import shape | Tooling: an ESLint rule, a tsconfig flag, prettier, a CI job |
| Judgment call, cross-cutting - security, error handling, layering, testing | `.claude/rules/<topic>.md`, plus an `@.claude/rules/<topic>.md` line in `CLAUDE.md` |
| One or two sentences that belong to a section `CLAUDE.md` already has | Edit `CLAUDE.md` in place |
| Specific to this PR's code | Nothing |

**A rule a linter can enforce belongs in the linter.** Writing it into
`CLAUDE.md` instead means the next contributor - human or agent - earns the
same review comment, because prose does not run in CI.

In this repository `npm run lint` covers only `nodes/` and `package.json`.
A rule that must also hold in `lib/`, `helpers/` or `credentials/` needs the
lint glob widened as part of the same change, otherwise it is enforced nowhere.

Write the rule as a rule - the condition and what to do - not as a paraphrase
of the reviewer's sentence about this one line.

## 5. Answer and resolve

Every thread gets a reply, posted through gh-comment:

| Label | Reply | Resolve the thread |
|---|---|---|
| ACCEPT | What changed, and the commit sha | Yes |
| REJECT | The technical reason for disagreeing | No |
| DEFER | Why it is out of scope, and where it is tracked | No |
| CLARIFY | Nothing yet - the question goes to the user first | No |

Reply first, resolve second, and only after the change is committed and pushed
- the reply cites a sha that has to exist.

```bash
gh api graphql -f query='mutation($t:ID!){resolveReviewThread(input:{threadId:$t}){thread{isResolved}}}' -F t=<threadId>
```

## 6. Report

One table for the user: thread → label → what changed → where the rule landed
(or "not generalizable"). Name every thread left open and why.

## Red flags - stop

- Resolving a thread to shorten the list
- Resolving a REJECT or a DEFER
- Resolving everything at the end, without a reply on each thread
- Leaving a disagreement silent - silence reads as agreement
- Adding a line to `CLAUDE.md` for something ESLint could catch
- Pasting the reviewer's sentence into `CLAUDE.md` as if it were a rule
- Implementing a CLARIFY item "as best I understand it"

## Rationalizations

| Excuse | Reality |
|---|---|
| "The reviewer is senior, no need to verify" | Reviewers miss context this codebase has. Verify, then implement. |
| "I'll resolve now and fix in a follow-up" | Resolved means done. An intention is not a change. |
| "It's too small to be a rule" | Small and recurring is precisely what a rule is for. Repetition is the signal. |
| "I disagree, so I'll just not do it" | An unanswered thread reads as agreement, then as an oversight. Reply. |
| "I'll answer all the threads at the end" | Batched at the end is where replies get dropped and threads get resolved blind. |
| "Documenting it in CLAUDE.md is enough" | If a linter can check it, prose is the weaker copy that drifts. |
| "The thread is outdated, the code moved" | Outdated means the diff moved, not that the point was addressed. Triage it. |
