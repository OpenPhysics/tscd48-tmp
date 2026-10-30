# Branch Protection Rules

This document outlines the recommended branch protection settings for the `tscd48` repository to ensure code quality and prevent accidental pushes to protected branches.

## Required Status Checks

The following CI jobs must pass before merging to `main` (defined in `.github/workflows/ci.yml`):

| Status Check          | Job Name                    | Purpose                                                                             |
| --------------------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| **verify**            | Lint, Test, Build & Audit    | Format check, lint, typecheck, unit/integration tests + coverage, build, `npm audit` |
| **e2e**                | E2E Tests                    | Runs Playwright end-to-end tests (pull requests only)                               |
| **dependency-review** | (from `OpenPhysics/relay`)   | Reusable workflow; flags newly introduced vulnerable dependencies (pull requests only) |
| **codeql**             | (from `OpenPhysics/relay`)   | Reusable workflow; static security analysis (push and pull requests)                |

Everything that used to run as separate jobs — lint, typecheck, test, and build — now runs as
sequential steps inside the single **verify** job, so there is one status check for all of it
instead of four. There is also no longer a Node-version test matrix; CI runs on Node 26 only
(the version declared in `package.json` `engines`).

## Recommended GitHub Branch Protection Settings

### For `main` Branch

Navigate to **Settings > Branches > Add branch protection rule** and configure:

#### Branch name pattern

```
main
```

#### Protect matching branches

- [x] **Require a pull request before merging**
  - [x] Require approvals: `1` (or more for larger teams)
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners (if CODEOWNERS file exists)

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Status checks that are required:
    - `verify`
    - `e2e`
    - `dependency-review`
    - `codeql`

- [x] **Require conversation resolution before merging**

- [x] **Require signed commits** (optional but recommended)

- [x] **Require linear history** (optional - enforces rebase/squash merges)

- [x] **Do not allow bypassing the above settings**

- [ ] **Allow force pushes** - Keep UNCHECKED

- [ ] **Allow deletions** - Keep UNCHECKED

### For Release Branches (`release/*`)

```
release/*
```

Same settings as `main`, but may allow maintainers to bypass for hotfixes.

## Local Pre-Push Checks

The repository includes a pre-push Git hook (`.husky/pre-push`) that runs the following checks locally before pushing:

1. **Format & Lint Check** (`npm run format:check`, i.e. `biome check .`)
   - Verifies Biome formatting and lint rules
   - Fix with: `npm run lint:fix` or `biome check --write .`

2. **TypeScript Check** (`npm run typecheck`)
   - Verifies TypeScript compilation
   - Fix type errors manually

3. **Unit Tests** (`npm test -- --run`)
   - Runs all unit tests
   - Fix failing tests before pushing

### Bypassing Pre-Push Hooks (Not Recommended)

In emergency situations, you can bypass hooks with:

```bash
git push --no-verify
```

**Warning:** This should only be used in exceptional circumstances. The CI pipeline will still enforce all checks.

## CI Workflow Timeouts

All CI jobs have timeout limits to prevent runaway processes:

| Job                            | Timeout    |
| ------------------------------- | ---------- |
| verify (lint/typecheck/test/build/audit) | 20 minutes |
| e2e                             | 20 minutes |

`dependency-review` and `codeql` are reusable workflows defined in `OpenPhysics/relay`; their
timeouts are set there, not in this repository.

## Setting Up Branch Protection via GitHub CLI

You can also configure branch protection using the GitHub CLI:

```bash
# Require status checks
gh api repos/{owner}/{repo}/branches/main/protection \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks='{"strict":true,"contexts":["verify","e2e","dependency-review","codeql"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  -f restrictions=null
```

## Rulesets (GitHub Enterprise / Public Repos)

For repositories using GitHub Rulesets (newer feature), create a ruleset with:

1. **Target**: `main` branch
2. **Bypass list**: None (or specific teams for emergencies)
3. **Rules**:
   - Restrict deletions
   - Restrict force pushes
   - Require linear history
   - Require pull request
   - Require status checks (list above)
   - Require signed commits (optional)

## Troubleshooting

### Status check not appearing

If a status check doesn't appear in the list:

1. Ensure the workflow has run at least once on a PR
2. Check that the job name matches exactly (`verify`, `e2e`)
3. For the reusable-workflow checks (`dependency-review`, `codeql`), confirm the exact check
   name shown in the PR's checks list, since reusable workflows can prefix or rename it

### Pre-push hook not running

1. Ensure Husky is installed: `npm run prepare`
2. Check hook is executable: `chmod +x .husky/pre-push`
3. Verify Git hooks path: `git config core.hooksPath`

### CI failing but local passes

1. Ensure dependencies are up to date: `npm ci`
2. Check Node.js version matches CI (26 — there is no longer a multi-version test matrix)
3. Run the exact CI command locally
