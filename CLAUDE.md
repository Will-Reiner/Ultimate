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

### Arquitetura — Flat Client

O mobile é um cliente REST puro (sem modo offline). Toda a lógica de negócio vive no backend. A estrutura reflete isso: sem camadas DDD — apenas tipos, serviços de API, estado (Zustand) e UI.

### Estrutura de Diretórios

```
apps/mobile/
├── app/                            ← Expo Router
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/login.tsx + register.tsx
│   └── (app)/habits/index.tsx + new.tsx + [id]/index.tsx + [id]/edit.tsx
├── src/
│   ├── types/                      ← interfaces puras (DTOs da API)
│   │   ├── user.ts                 ← UserDTO, AuthResultDTO
│   │   └── habit.ts                ← HabitDTO, HabitDetailDTO, HabitType, etc.
│   ├── services/                   ← chamadas HTTP + mapeamento de resposta
│   │   ├── api.ts                  ← ApiClient (axios) + ApiError
│   │   ├── authService.ts          ← login(), register()
│   │   └── habitService.ts         ← CRUD de hábitos + streak calculation
│   ├── storage/
│   │   └── TokenStorage.ts         ← expo-secure-store
│   ├── stores/                     ← Zustand (estado reativo)
│   │   ├── authStore.ts
│   │   └── habitStore.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useHabits.ts
│   └── components/
│       └── ui/Button.tsx + Input.tsx
└── .env.example                    ← EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Path Aliases

| Alias | Resolve para |
|---|---|
| `@app-types/*` | `src/types/*` |
| `@services/*` | `src/services/*` |
| `@storage/*` | `src/storage/*` |
| `@stores/*` | `src/stores/*` |
| `@hooks/*` | `src/hooks/*` |
| `@components/*` | `src/components/*` |

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
│   ├── prisma/                        ← PrismaService (@Global, inalterado)
│   └── modules/
│       ├── user/
│       │   ├── domain/
│       │   │   ├── entities/User.ts
│       │   │   ├── repositories/IUserRepository.ts
│       │   │   └── errors/UserErrors.ts
│       │   ├── application/
│       │   │   ├── use-cases/FindUserByEmailUseCase.ts + FindUserByIdUseCase.ts + CreateUserUseCase.ts
│       │   │   └── dtos/UserResponseDto.ts
│       │   ├── infrastructure/
│       │   │   ├── repositories/UserRepositoryImpl.ts  ← Prisma
│       │   │   └── services/PasswordService.ts         ← bcrypt
│       │   └── presentation/
│       │       └── users.module.ts    ← sem controller (módulo de suporte)
│       ├── auth/
│       │   ├── application/
│       │   │   ├── use-cases/LoginUseCase.ts + RegisterUseCase.ts
│       │   │   └── dtos/AuthResponseDto.ts
│       │   └── presentation/
│       │       ├── auth.module.ts + auth.controller.ts + auth.service.ts
│       │       ├── dtos/login.dto.ts + register.dto.ts
│       │       ├── guards/jwt-auth.guard.ts
│       │       └── strategies/jwt.strategy.ts
│       └── habit/
│           ├── domain/
│           │   ├── entities/Habit.ts + HabitEntry.ts
│           │   ├── repositories/IHabitRepository.ts
│           │   └── errors/HabitErrors.ts
│           ├── application/
│           │   ├── use-cases/GetHabitsUseCase.ts + GetHabitUseCase.ts + CreateHabitUseCase.ts
│           │   │              + UpdateHabitUseCase.ts + DeleteHabitUseCase.ts
│           │   │              + GetEntriesUseCase.ts + CreateEntryUseCase.ts
│           │   └── dtos/HabitResponseDto.ts  ← tipos + mappers
│           ├── infrastructure/
│           │   └── repositories/HabitRepositoryImpl.ts  ← Prisma
│           └── presentation/
│               ├── habits.module.ts + habits.controller.ts + habits.service.ts
│               └── dtos/create-habit.dto.ts + update-habit.dto.ts + create-entry.dto.ts
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

### Stores Zustand (mobile)
- Finas: só estado reativo + chamada ao service
- Lógica de negócio e mapeamento ficam nos `services/`

### Services (mobile)
- Função pura por operação (`login`, `getHabits`, etc.)
- Responsáveis por mapear resposta da API para os tipos de `src/types/`
- Testes: mockar `api` (ApiClient)

### Entities do backend (DDD)
- Construtor privado → `Entity.restore()` reconstrói a partir do Prisma
- Getters públicos, sem setters
- Sem dependências do NestJS ou Prisma

### Use Cases do backend
- Recebem interfaces (nunca implementações concretas via `@Inject(TOKEN)`)
- Lançam erros de domínio (`HabitNotFoundError`, etc.); a camada de apresentação converte para exceções NestJS
- `auth.service.ts` e `habits.service.ts` são façades finas → orquestram use cases

### DTOs de validação (backend)
- Ficam em `presentation/dtos/` para não poluir application com decorators NestJS
- DTOs de resposta (tipos puros) ficam em `application/dtos/`

---

## Adicionando um Novo Módulo

### Mobile
1. Tipos em `src/types/<modulo>.ts`
2. Chamadas HTTP em `src/services/<modulo>Service.ts`
3. Store em `src/stores/<modulo>Store.ts`
4. Hook em `src/hooks/use<Modulo>.ts`
5. Telas em `app/(app)/<modulo>/`

### API (NestJS + DDD)
1. Model em `prisma/schema.prisma` + `npm run migrate`
2. `src/modules/<modulo>/domain/` → entities, IRepository, errors
3. `src/modules/<modulo>/application/` → use cases + dtos de resposta
4. `src/modules/<modulo>/infrastructure/repositories/<Modulo>RepositoryImpl.ts`
5. `src/modules/<modulo>/presentation/` → module, controller, service (façade), dtos de input
6. Importar o novo `<Modulo>Module` em `app.module.ts`


## to do
- 6-financas.md
- 7-dashboard-metas.md