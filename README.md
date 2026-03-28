# Motus 🟥🟡

A web-based Motus word game built with PHP, JavaScript, MySQL and Docker.

## Game rules

- Guess the secret French word in **6 attempts**
- The first letter is always revealed
- Each attempt shows colored feedback:
  - 🟥 **Red border** — correct letter, correct position
  - 🟡 **Yellow circle** — correct letter, wrong position
  - 🟦 **Blue background** — letter not in the word
- 3 difficulty levels: Easy (4-5 letters), Normal (6-7), Hard (8-10)

## Run the project

**1. Clone the repo**
```bash
git clone <repo-url>
cd motus-game
```

**2. Create your `.env` from the example**
```bash
cp .env.exemple .env
```

**3. Start**
```bash
make up
```

The game is available at **http://localhost:7777**

## Author

yumetia
