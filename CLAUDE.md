# Notes for Claude

<!-- github-workflow:start (same in all kingof9x repos; edit the template, not here) -->
## GitHub workflow (follow this every time)

Callum tests and merges. You write the code and open the pull request (PR).
He is not a git expert, so keep his side to: open the PR, test the build, merge.

1. **Branch.** Work on a branch named `claude/<short-topic>`. Never commit or push to `main`,
   never force-push, never merge a PR, never delete branches or tags.
2. **One PR per task, opened early.** Push the branch and open the PR straight away, before the
   build finishes. Fill in the PR template (What changed / How to test / What you should see /
   Notes and risks) in plain language. If `gh pr create` fails, use the REST API
   (`gh api repos/kingof9x/nynex.dev/pulls -X POST ...`). If you can't open it, give this exact link:
   `https://github.com/kingof9x/nynex.dev/compare/main...BRANCH?expand=1`
3. **Keep the branch up to date by merging.** If `main` moved on, merge `main` into your branch.
   Don't rebase or force-push a branch that is already pushed.
4. **No automatic build here.** This repo has no test-build workflow, so the test steps must say
   exactly which files to open or run from the PR branch.
5. **Hand off the same way every time.** End with the PR link and 2–5 numbered test steps,
   ending with what he should see if it works.
6. **Don't add release or build workflows** unless he asks.

If anything here can't be done (no push access, the PR can't be opened, the build is red),
say so plainly at once rather than at the end.
<!-- github-workflow:end -->
