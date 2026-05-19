# Contributing to Syncronus

Thank you for your interest in contributing! Here's everything you need to get started.

---

## 🧭 Before You Start

- Check the [open issues](https://github.com/your-username/syncronus/issues) to see if your idea or bug is already tracked
- For significant changes, open an issue first to discuss the approach before writing code
- Small fixes (typos, obvious bugs) can go straight to a pull request

---

## 🛠 Development Setup

### Prerequisites
- Node.js >= 18
- MongoDB running locally or a connection string to Atlas
- Redis running locally or a connection string to Upstash

### Fork and clone

```bash
git clone https://github.com/your-username/syncronus.git
cd syncronus
```

### Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### Set up environment variables

Copy the example env files and fill in your values:

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.example client/.env
```

### Run in development

```bash
# Terminal 1 — server
cd server && npm run dev

# Terminal 2 — client
cd client && npm run dev
```

---

## 🌿 Branching

| Branch type | Naming convention | Example |
|---|---|---|
| Feature | `feature/description` | `feature/typing-indicator` |
| Bug fix | `fix/description` | `fix/emoji-toggle` |
| UI / design | `ui/description` | `ui/profile-info-redesign` |
| Docs | `docs/description` | `docs/update-readme` |

Always branch off `main`:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature
```

---

## ✅ Pull Request Checklist

Before submitting a PR, confirm:

- [ ] Code runs without errors locally
- [ ] New feature works end-to-end (client + server)
- [ ] No `console.log` debug statements left in production code
- [ ] Environment variables are not hardcoded
- [ ] `.env` files are not committed
- [ ] PR description explains what was changed and why

---

## 📐 Code Style

- **JavaScript** — ES Modules (`import`/`export`) throughout
- **React** — functional components and hooks only, no class components
- **Naming** — camelCase for functions and variables, PascalCase for components
- **Comments** — add comments for non-obvious logic, especially in socket handlers and aggregation pipelines
- **Imports** — group in order: external libraries → internal modules → relative imports

---

## 🐛 Reporting Bugs

Open an issue and include:

1. What you expected to happen
2. What actually happened
3. Steps to reproduce
4. Your Node.js version, OS, and browser

---

## 💡 Suggesting Features

Open an issue with the `enhancement` label. Describe:

1. The problem you're trying to solve
2. Your proposed solution
3. Any alternatives you considered

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
