# Working on this repo

## Commit identity

This repository is public, and a commit's author address is permanent: it stays
in the commit object even after the branch is rewritten, and hosting providers
keep serving unreachable objects by SHA. Treat it as unrecoverable once pushed.

**Only ever commit as `<username>@users.noreply.github.com`.** Never use a
work, employer, or organisation address here — not in `user.email`, not in a
`Co-Authored-By:` trailer, not in a commit message, and not in a file.

The machine-wide git identity is a real personal address, so this repo sets its
own:

```bash
git config user.email 'USERNAME@users.noreply.github.com'
git config user.name  'USERNAME'
```

A `pre-commit` hook enforces this. Turn it on once per clone:

```bash
git config core.hooksPath .githooks
```

It allowlists the noreply form rather than blocking particular addresses —
listing the addresses to avoid would put them in the repository, which is the
thing being prevented.

Also enable **Settings → Emails → Block command line pushes that expose my
email** on the account: that is the backstop for a clone where the hook was
never turned on.

## Before making this public again

```bash
git log --all --pretty=format:'%ae%n%ce' | sort -u
```

Every address listed should be a noreply one. Grepping the working tree does
not catch this — the address lives in the commit metadata, not in any file.
