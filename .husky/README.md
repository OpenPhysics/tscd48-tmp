# Git Hooks

This directory contains Git hooks managed by [Husky](https://typicode.github.io/husky/).

## Available Hooks

### pre-commit

Runs before each commit to ensure code quality:

- Runs `biome check --write` on staged `*.{ts,js,json,md}` files (lint and format)
- Only processes staged files (via lint-staged)

**What happens:**

```bash
🔍 Running pre-commit checks...
✔ biome check --write --no-errors-on-unmatched
```

### commit-msg

Validates commit messages follow Conventional Commits format:

- Checks message format
- Enforces lowercase subjects
- Validates commit types

**What happens:**

```bash
📝 Validating commit message...
✔ Commit message follows conventional commits format
```

### pre-push

Runs before pushing to remote repository:

- Biome check (`npm run format:check`)
- TypeScript type check (`npm run typecheck`)
- Unit tests (`npm test -- --run`)

**What happens:**

```bash
🚀 Running pre-push checks...
✅ Biome check passed
✅ TypeScript check passed
✅ Tests passed
```

## Bypassing Hooks

While not recommended for production code, you can bypass hooks when necessary:

```bash
# Skip all pre-commit hooks
git commit --no-verify -m "wip: work in progress"

# Skip pre-push hook
git push --no-verify
```

⚠️ **Important:** Code pushed to the main branch must pass all checks. CI will reject changes that don't meet quality standards.

## Troubleshooting

### Hooks not running?

Ensure hooks are executable:

```bash
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### Biome errors?

Fix automatically:

```bash
npm run lint:fix
npm run format
```

### Tests failing?

Run tests locally to debug:

```bash
npm test
npm run test:coverage
```
