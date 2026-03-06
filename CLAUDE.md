# Ultimate — Rotina e Lifestyle

Aplicativo mobile para gerenciamento de hábitos e ajuda com problemas modernos de estilo de vida.

## Estrutura do Monorepo

```
Ultimate/                       ← raiz do monorepo
├── apps/
│   ├── mobile/                 ← App Expo (React Native + TypeScript)
│   └── api/                    ← Backend NestJS (TypeScript + Prisma)
├── docker-compose.yml          ← PostgreSQL + API (dev)
├── .env.example                ← variáveis para o docker-compose
└── CLAUDE.md
```

---

## apps/mobile — App Mobile

### Stack

| Camada | Tecnologia |
|---|---|
| Plataforma | Expo (iOS + Android) |
| Linguagem | TypeScript (strict) |
| Navegação | Expo Router (file-based) |
| UI | NativeWind (TailwindCSS para RN) |
| Estado | Zustand |
| HTTP | Axios |
| Token | expo-secure-store |
| Testes | Jest + ts-jest |

### Arquitetura — Clean Architecture + DDD

```
Presentation  →  Application  →  Domain  ←  (interfaces apenas)
     ↑               ↑
Infrastructure  ──────────────────────────→  (implementa interfaces do Domain)
```

### Estrutura de Diretórios

```
apps/mobile/
├── app/                            ← Expo Router
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/login.tsx + register.tsx
│   └── (app)/habits/index.tsx + [id].tsx
├── src/
│   ├── domain/                     ← puro TS, sem deps externas
│   │   ├── user/entities/User.ts + User.spec.ts
│   │   └── habit/entities/Habit.ts + Habit.spec.ts + HabitEntry.ts
│   ├── application/                ← use cases + DTOs
│   │   ├── user/use-cases/LoginUseCase.ts + .spec.ts + RegisterUseCase.ts
│   │   └── habit/use-cases/HabitUseCases.ts + .spec.ts + CompleteHabitUseCase.ts
│   ├── infrastructure/             ← implementações concretas
│   │   ├── http/HttpClient.ts + ApiClient.ts
│   │   ├── repositories/UserRepositoryImpl.ts + HabitRepositoryImpl.ts
│   │   └── storage/TokenStorage.ts
│   └── presentation/               ← React Native
│       ├── stores/authStore.ts + habitStore.ts
│       ├── hooks/useAuth.ts + useHabits.ts
│       └── components/ui/Button.tsx + Input.tsx
└── .env.example                    ← EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Path Aliases

| Alias | Resolve para |
|---|---|
| `@domain/*` | `src/domain/*` |
| `@application/*` | `src/application/*` |
| `@infrastructure/*` | `src/infrastructure/*` |
| `@presentation/*` | `src/presentation/*` |
| `@shared/*` | `src/shared/*` |

### Comandos (dentro de `apps/mobile/`)

```bash
npm start           # dev server Expo
npm test            # Jest — Domain + Application
npm run test:watch
npm run typecheck   # tsc --noEmit
```

---

## apps/api — Backend NestJS

### Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS 11 (Fastify adapter) |
| Linguagem | TypeScript (strict) |
| ORM | Prisma 6 |
| Banco | PostgreSQL 16 |
| Auth | JWT (access 15 min + refresh 30 dias) |
| Hash | bcrypt (12 rounds) |
| Validação | class-validator + class-transformer |

### Estrutura

```
apps/api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── prisma/        ← PrismaService (@Global)
│   ├── users/         ← UsersService
│   ├── auth/          ← POST /auth/login|register + JWT strategy
│   └── habits/        ← /habits CRUD + /habits/:id/entries
├── prisma/schema.prisma
├── Dockerfile
└── .env.example
```

### Endpoints

| Endpoint | Método | Auth | Descrição |
|---|---|---|---|
| `/auth/login` | POST | — | `{ email, password }` → tokens |
| `/auth/register` | POST | — | `{ name, email, password }` → tokens |
| `/habits` | GET | JWT | Lista hábitos do usuário autenticado |
| `/habits` | POST | JWT | Criar hábito |
| `/habits/:id` | GET | JWT | Buscar hábito |
| `/habits/:id` | PUT | JWT | Atualizar hábito |
| `/habits/:id` | DELETE | JWT | Deletar hábito |
| `/habits/:id/entries` | GET | JWT | `?from=&to=` → histórico |
| `/habits/:id/entries` | POST | JWT | Registrar conclusão |

### Comandos (dentro de `apps/api/`)

```bash
npm run start:dev       # dev com hot reload
npm run build
npm run migrate         # prisma migrate dev
npm run migrate:prod    # prisma migrate deploy (produção)
npm run generate        # prisma generate
npm run studio          # Prisma Studio
```

---

## Docker

### Desenvolvimento local

```bash
# 1. Copie e edite o .env na raiz
cp .env.example .env

# 2. Sobe banco + API
docker-compose up

# 3. (Primeira vez) rode as migrations
docker-compose exec api npx prisma migrate dev --name init

# Só o banco (API roda no host)
docker-compose up postgres -d
cd apps/api && npm run start:dev
```

### Produção (VPS)

```bash
# Build da imagem de produção (roda migrate deploy automaticamente no CMD)
docker build --target production -t ultimate-api ./apps/api
```

---

## Convenções de Código

### Testes (mobile)
- `.spec.ts` na **mesma pasta** do arquivo testado
- **Domain**: sem mocks (regras puras de negócio)
- **Application**: mocka repositories com `jest.fn()`

### Entities (mobile)
- Construtor privado → `Entity.create()` valida, `Entity.restore()` só reconstrói
- Imutáveis: métodos que "modificam" retornam nova instância

### Use Cases (mobile)
- Recebem interfaces (nunca implementações concretas)
- Retornam DTOs (nunca entities)

### Stores Zustand
- Finas: só estado reativo + chamada ao use case
- Lógica de negócio fica nos use cases

---

## Adicionando um Novo Módulo

### Mobile (DDD)
1. `src/domain/<modulo>/entities/`, `repositories/`, `errors/`
2. `src/application/<modulo>/use-cases/` + `dtos/`
3. `src/infrastructure/repositories/<Modulo>RepositoryImpl.ts`
4. `src/presentation/stores/<modulo>Store.ts` + `hooks/use<Modulo>.ts`
5. `app/(app)/<modulo>/index.tsx`
6. `.spec.ts` ao lado de cada use case e entity

### API (NestJS)
1. Model em `prisma/schema.prisma` + `npm run migrate`
2. `src/<modulo>/<modulo>.module.ts|service.ts|controller.ts`
3. `src/<modulo>/dto/*.ts`
4. Importar módulo em `app.module.ts`
