# Ultimate — Rotina e Lifestyle

Aplicativo mobile para gerenciamento de hábitos, ajudando usuários a construir rotinas saudáveis e superar problemas modernos de estilo de vida.

---

## Estrutura do Monorepo

```
Ultimate/
├── apps/
│   ├── mobile/          ← App Expo (React Native + TypeScript)
│   └── api/             ← Backend NestJS (TypeScript + Prisma)
├── docker-compose.yml   ← PostgreSQL + API (dev)
├── .env.example
└── README.md
```

---

## Stack

### Mobile (`apps/mobile`)

| Camada | Tecnologia |
|---|---|
| Plataforma | Expo ~55 (iOS + Android) |
| Linguagem | TypeScript 5.9 (strict) |
| Navegação | Expo Router (file-based) |
| UI | NativeWind 4 (TailwindCSS para RN) |
| Estado global | Zustand 5 |
| HTTP | Axios |
| Armazenamento seguro | expo-secure-store |
| Testes | Jest 30 + ts-jest |

### API (`apps/api`)

| Camada | Tecnologia |
|---|---|
| Framework | NestJS 11 (Fastify adapter) |
| Linguagem | TypeScript 5.8 (strict) |
| ORM | Prisma 6 |
| Banco de dados | PostgreSQL 16 |
| Autenticação | JWT (access 15 min + refresh 30 dias) |
| Hash de senha | bcrypt (12 rounds) |
| Validação | class-validator + class-transformer |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 22
- [Docker](https://www.docker.com/) e Docker Compose
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)

---

## Início Rápido

### 1. Clone e instale dependências

```bash
git clone <repo-url>
cd Ultimate

# Instala dependências do mobile e da API
npm install --prefix apps/mobile
npm install --prefix apps/api
```

### 2. Configure as variáveis de ambiente

```bash
# Raiz (Docker)
cp .env.example .env

# API
cp apps/api/.env.example apps/api/.env

# Mobile
cp apps/mobile/.env.example apps/mobile/.env
```

Edite os arquivos `.env` conforme necessário. Variáveis principais:

| Variável | Descrição |
|---|---|
| `POSTGRES_PASSWORD` | Senha do banco PostgreSQL |
| `JWT_ACCESS_SECRET` | Secret do token de acesso JWT |
| `JWT_REFRESH_SECRET` | Secret do token de refresh JWT |
| `EXPO_PUBLIC_API_URL` | URL da API consumida pelo mobile |

### 3. Suba a infraestrutura com Docker

```bash
# Sobe PostgreSQL + API com hot reload
docker-compose up -d

# Primeira vez: rode as migrations
docker-compose exec api npx prisma migrate dev --name init
```

### 4. Inicie o app mobile

```bash
cd apps/mobile
npm start
```

Escaneie o QR Code com o [Expo Go](https://expo.dev/client) ou pressione `a` (Android) / `i` (iOS).

---

## Scripts

### Raiz do monorepo

```bash
npm run mobile        # Inicia o dev server do Expo
npm run api           # Inicia a API com hot reload
npm run db            # Sobe apenas o PostgreSQL
npm run docker:up     # Sobe todos os serviços Docker
npm run docker:down   # Para todos os serviços Docker
npm run docker:logs   # Acompanha os logs dos containers
```

### Mobile (`apps/mobile`)

```bash
npm start             # Dev server Expo
npm run android       # Abre no emulador Android
npm run ios           # Abre no simulador iOS
npm test              # Executa os testes (Jest)
npm run test:watch    # Testes em modo watch
npm run typecheck     # Verificação de tipos (tsc --noEmit)
```

### API (`apps/api`)

```bash
npm run start:dev     # Dev com hot reload
npm run build         # Build de produção
npm run migrate       # prisma migrate dev
npm run migrate:prod  # prisma migrate deploy
npm run generate      # prisma generate
npm run studio        # Abre o Prisma Studio
```

---

## Arquitetura Mobile

O app mobile segue **Clean Architecture + DDD**:

```
Presentation  →  Application  →  Domain  ←  (interfaces apenas)
     ↑               ↑
Infrastructure  ──────────────────────────→  (implementa interfaces do Domain)
```

```
src/
├── domain/           ← Entidades, repositórios (interfaces), erros — puro TS
├── application/      ← Use cases + DTOs
├── infrastructure/   ← HttpClient, repositórios concretos, TokenStorage
└── presentation/     ← Stores Zustand, hooks, componentes React Native
```

### Path Aliases

| Alias | Resolve para |
|---|---|
| `@domain/*` | `src/domain/*` |
| `@application/*` | `src/application/*` |
| `@infrastructure/*` | `src/infrastructure/*` |
| `@presentation/*` | `src/presentation/*` |
| `@shared/*` | `src/shared/*` |

---

## Endpoints da API

Todos os endpoints protegidos requerem header `Authorization: Bearer <token>`.

| Endpoint | Método | Auth | Descrição |
|---|---|---|---|
| `/auth/register` | POST | — | Cria conta → retorna tokens |
| `/auth/login` | POST | — | Autentica → retorna tokens |
| `/habits` | GET | JWT | Lista hábitos do usuário |
| `/habits` | POST | JWT | Cria um novo hábito |
| `/habits/:id` | GET | JWT | Busca hábito por ID |
| `/habits/:id` | PUT | JWT | Atualiza hábito |
| `/habits/:id` | DELETE | JWT | Remove hábito |
| `/habits/:id/entries` | GET | JWT | Histórico (`?from=&to=`) |
| `/habits/:id/entries` | POST | JWT | Registra conclusão |

---

## Banco de Dados

Schema gerenciado pelo Prisma. Modelos principais:

- **User** — conta do usuário (nome, e-mail, senha hasheada)
- **Habit** — hábito com frequência, tipo, cor, emoji e lembretes
- **HabitEntry** — registro de conclusão de um hábito em uma data

```bash
# Visualizar e editar dados via GUI
cd apps/api && npm run studio
```

---

## Deploy (Produção)

```bash
# Build da imagem de produção
# O CMD executa migrate deploy automaticamente antes de iniciar
docker build --target production -t ultimate-api ./apps/api

docker run -p 3000:3000 \
  -e DATABASE_URL=<url> \
  -e JWT_ACCESS_SECRET=<secret> \
  -e JWT_REFRESH_SECRET=<secret> \
  ultimate-api
```

---

## Testes

Os testes cobrem as camadas **Domain** e **Application**:

```bash
cd apps/mobile
npm test              # Todos os testes
npm run test:watch    # Modo interativo
```

- **Domain**: sem mocks (regras puras de negócio)
- **Application**: repositórios mockados com `jest.fn()`
- Arquivos `.spec.ts` ficam na mesma pasta do arquivo testado

---

## Licença

Projeto privado — todos os direitos reservados.
