# DV360 Agent — Chat UI

Webowy chat agent dla DV360 Mock API. Zbudowany na Next.js + Anthropic API.

## Stack

- **Next.js 14** — frontend + API routes
- **Anthropic SDK** — claude-sonnet-4-6 z agentic loop
- **Railway** — hosting
- **Google Apps Script** — mock DV360 API (backend danych)

---

## Deploy na Railway — krok po kroku

### 1. Wgraj kod na GitHub

```bash
# W folderze dv360-chat:
git init
git add .
git commit -m "init: DV360 Agent"

# Utwórz repo na github.com, potem:
git remote add origin https://github.com/TWOJA_NAZWA/dv360-chat.git
git push -u origin main
```

### 2. Utwórz projekt na Railway

1. Wejdź na https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Wybierz repo `dv360-chat`
4. Railway automatycznie wykryje Next.js i zacznie build

### 3. Dodaj zmienne środowiskowe

W panelu Railway → zakładka **Variables** → dodaj:

| Nazwa | Wartość |
|-------|---------|
| `ANTHROPIC_API_KEY` | `sk-ant-...twój klucz...` |
| `GAS_URL` | `https://script.google.com/macros/s/...twój GAS URL.../exec` |

### 4. Ustaw domenę publiczną

Railway → zakładka **Settings** → **Networking** → **Generate Domain**

Dostaniesz URL w stylu `https://dv360-chat-production.up.railway.app` — to Twój publiczny link.

---

## Lokalny development

```bash
# 1. Zainstaluj zależności
npm install

# 2. Utwórz plik .env.local
cp .env.example .env.local
# Uzupełnij ANTHROPIC_API_KEY i GAS_URL

# 3. Uruchom dev server
npm run dev
# → http://localhost:3000
```

---

## Przykładowe polecenia w chacie

```
Pokaż wszystkich reklamodawców
Lista aktywnych kampanii reklamodawcy 1
Znajdź kreacje z wymiarem 300
Wyszukaj line items zawierające "display"
Utwórz kampanię "Q4 2025" dla reklamodawcy 2, cel: brand awareness
Zatrzymaj line item o ID 3
Usuń kreację o ID 5
Pokaż wszystkie kampanie reklamodawcy Global Brand
```
