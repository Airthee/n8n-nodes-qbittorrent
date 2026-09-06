---
name: gh-comment
description: Use when posting anything to GitHub as the agent - replying in a pull request review thread, commenting on a PR or an issue, or sending an automated message.
---

# Posting GitHub comments as Claude

## Overview

Every comment this agent posts to GitHub carries a `(Claude)` prefix, so anyone
reading the thread can tell agent output from a human's without opening a
profile page.

**Core principle:** the prefix is a marker, not prose. It is never translated,
reworded, moved further down, or dropped because the message is short.

This skill is the single place comments get posted. Any other skill that needs
to say something on GitHub delegates here instead of calling `gh pr comment`
itself - that is what keeps the prefix from being forgotten.

## The contract

The body starts on its very first line with:

```
(Claude) <first word of the message>
```

No blank line, no heading, no greeting before it. One prefix per comment, not
per paragraph.

```
(Claude) Fixed in 8f2a1c3 - `buildHeaders` now retries once on 403 instead of
throwing, so an expired session self-heals.
```

Comment bodies follow the repository's language policy (English here), but the
prefix stays `(Claude)` verbatim in every language.

## Quick reference

| Target | Command |
|---|---|
| PR conversation | `gh pr comment <n> --body-file <file>` |
| Issue | `gh issue comment <n> --body-file <file>` |
| Reply in a review thread (thread id known) | `gh api graphql -f query='mutation($t:ID!,$b:String!){addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$t,body:$b}){comment{url}}}' -F t=<threadId> -F b=@<file>` |
| Reply to a review comment (comment id known) | `gh api repos/{owner}/{repo}/pulls/<n>/comments -F in_reply_to=<commentId> -F body=@<file>` |
| Edit a comment already posted | `gh api --method PATCH repos/{owner}/{repo}/issues/comments/<id> -F body=@<file>` |

Always pass the body through a file (`--body-file`, or `-F key=@file` for
`gh api`). Bodies contain backticks, quotes and newlines; an inline `--body`
gets mangled by the shell sooner or later. Write the file to the scratchpad
directory, not into the repository.

`gh api` expands `{owner}` and `{repo}` from the current checkout. GraphQL does
not - get the values with `gh repo view --json nameWithOwner`.

## Before every post

1. **Draft to a file.** Read it back once before sending.
2. **Check for a duplicate.** Read the existing comments on the target;
   `grep '(Claude)'` finds the agent's own previous messages. If one already
   makes the same point, edit it or say nothing - do not stack near-identical
   replies. This is the prefix's second job.
3. **Show the body and the target, then wait.** A GitHub comment is public and
   notifies people; it cannot be quietly taken back. One approval covers a
   batch the user has described ("answer the threads on PR 42"), never the
   batch after it.

## Common mistakes

- **Prefix after a heading.** `## Summary` then `(Claude) ...` defeats the
  purpose: the reader sees the heading in the notification, not the marker.
- **Signing as the human.** Never write the comment as if the repository owner
  wrote it, and never add their name to it. The prefix says who is speaking.
- **Posting the reasoning instead of the answer.** Reviewers want what changed
  and why, not a transcript of the deliberation.
- **A separate comment per point.** Grouping related answers into one comment
  costs the reviewer fewer notifications, except in review threads, where each
  thread gets its own reply.

## Red flags - stop

- About to run `gh pr comment` / `gh issue comment` outside this skill
- Writing `(Claude)` anywhere but the first characters of the body
- Translating the prefix, or making it `(Claude Code)`, `[Claude]`, `🤖`
- Posting before showing the draft
- Reposting a point an existing `(Claude)` comment already makes
- Dropping the prefix to satisfy "post this exactly as written"

## Rationalizations

| Excuse | Reality |
|---|---|
| "It's a one-line reply, the prefix is noise" | Short replies are exactly the ones mistaken for a human's. Prefix it. |
| "The bot account already makes it obvious" | Not in email notifications, mobile, or a quoted excerpt. Prefix it. |
| "The user told me to post, so no need to show the draft" | An instruction to post is not review of the wording. Show it. |
| "I'll add the prefix when I edit it afterwards" | The notification already went out unprefixed. There is no afterwards. |
| "This one is an automated status update, not a real comment" | Automated messages are the ones this convention exists for. |
| "They gave me the exact text, adding anything disobeys them" | The prefix is not part of the message - it says who is speaking. Post their text unchanged, with the prefix in front of it. |
