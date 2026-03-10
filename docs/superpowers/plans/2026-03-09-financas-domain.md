# Finanças — Domain Layer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete domain layer (entities, value objects, errors, business rules) for the Finance module using TDD.

**Architecture:** Follows existing DDD patterns — private constructors, `create()` with validation, `restore()` without validation, public getters, explicit mutation methods. All messages in Portuguese. Tests in `domain/__tests__/`.

**Tech Stack:** TypeScript (strict), Jest + ts-jest

---

## File Structure

```
apps/api/src/modules/finance/domain/
├── errors/
│   └── FinanceErrors.ts
├── value-objects/
│   ├── CategoryLimit.ts
│   ├── Installment.ts
│   └── TransactionRecurrence.ts
├── entities/
│   ├── FinanceTag.ts
│   ├── FinanceCategory.ts
│   ├── Account.ts
│   ├── CreditCard.ts
│   ├── Transaction.ts
│   ├── Invoice.ts
│   ├── Budget.ts
│   └── FinancialGoal.ts
└── __tests__/
    ├── CategoryLimit.spec.ts
    ├── Installment.spec.ts
    ├── TransactionRecurrence.spec.ts
    ├── FinanceTag.spec.ts
    ├── FinanceCategory.spec.ts
    ├── Account.spec.ts
    ├── CreditCard.spec.ts
    ├── Transaction.spec.ts
    ├── Invoice.spec.ts
    ├── Budget.spec.ts
    └── FinancialGoal.spec.ts
```

## Key Domain Decisions

1. **Tags as string[] (IDs)** — Transaction stores tag IDs (`string[]`), not embedded FinanceTag objects. Follows Task entity pattern.
2. **Date strings** — `date`, `closingDate`, `dueDate`, `month` stored as strings (`YYYY-MM-DD` / `YYYY-MM`). No Date objects for date-only fields.
3. **Balance mutations** — Account has `credit(amount)` and `debit(amount)` methods. Use cases orchestrate when to call them.
4. **Invoice totalAmount** — Mutable field updated by use cases via `updateTotalAmount()`. Invoice doesn't query transactions directly.
5. **Use-case-level rules excluded** — Duplicate checks (budget month, tag name), transaction generation (installments/recurrence), saldo recalculation, and budget spent calculation are NOT in domain entities.

## Scope Note — What's Domain vs Use-Case

| Rule from spec | Layer |
|---|---|
| Validation (name, amount, type, days) | Domain ✅ |
| State transitions (archive, invoice lifecycle, goal status) | Domain ✅ |
| Computed properties (availableLimit, progress, remainingAmount) | Domain ✅ |
| Recalculate balance on transaction CRUD | Use Case ❌ |
| Generate invoice automatically | Use Case ❌ |
| Generate installment transactions | Use Case ❌ |
| Budget spent/percentage calculation | Use Case ❌ |
| Duplicate name/month checks (require DB) | Use Case ❌ |
| Monthly balance/projection calculations | Use Case ❌ |

---

## Chunk 1: Errors + Simple Value Objects

### Task 1: FinanceErrors

**Files:**
- Create: `apps/api/src/modules/finance/domain/errors/FinanceErrors.ts`

- [ ] **Step 1: Create the errors file**

All domain errors for the finance module. No tests needed (trivial constructors following codebase pattern).

```typescript
// Errors needed:
// Account
AccountNotFoundError()
InvalidAccountNameError(reason)
InvalidAccountTypeError(type)
AccountArchivedError()

// CreditCard
CreditCardNotFoundError()
InvalidCreditCardNameError(reason)
InvalidCreditCardLimitError(reason)
InvalidClosingDayError()
InvalidDueDayError()
CreditCardArchivedError()

// Transaction
TransactionNotFoundError()
InvalidTransactionAmountError()
InvalidTransactionDescriptionError(reason)
InvalidTransactionSourceError(reason)
InvalidTransactionTypeError(reason)

// Installment
InvalidInstallmentError(reason)

// TransactionRecurrence
InvalidTransactionRecurrenceError(reason)

// Invoice
InvoiceNotFoundError()
InvalidInvoiceStatusTransitionError(from, to)
InvalidInvoicePaymentError(reason)

// Budget
BudgetNotFoundError()
InvalidBudgetLimitError(reason)
InvalidCategoryLimitError(reason)

// FinancialGoal
FinancialGoalNotFoundError()
InvalidFinancialGoalNameError(reason)
InvalidFinancialGoalAmountError(reason)
InvalidFinancialGoalStatusTransitionError(from, to)

// FinanceTag
InvalidFinanceTagNameError(reason)

// FinanceCategory
InvalidFinanceCategoryNameError(reason)
InvalidFinanceCategoryTypeError(type)
PredefinedCategoryImmutableError()
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/modules/finance/domain/errors/FinanceErrors.ts
git commit -m "feat(finance): add domain errors"
```

---

### Task 2: CategoryLimit Value Object (TDD)

**Files:**
- Create: `apps/api/src/modules/finance/domain/__tests__/CategoryLimit.spec.ts`
- Create: `apps/api/src/modules/finance/domain/value-objects/CategoryLimit.ts`

**Interface:**
```typescript
// create({ categoryId, limit }) — validates limit > 0
// restore({ categoryId, limit }) — no validation
// Getters: categoryId, limit
```

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement CategoryLimit**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

---

### Task 3: Installment Value Object (TDD)

**Files:**
- Create: `apps/api/src/modules/finance/domain/__tests__/Installment.spec.ts`
- Create: `apps/api/src/modules/finance/domain/value-objects/Installment.ts`

**Interface:**
```typescript
// create({ totalInstallments, currentInstallment, installmentAmount, parentTransactionId })
// Validation: totalInstallments > 0, currentInstallment >= 1 && <= totalInstallments, installmentAmount > 0
// restore(props) — no validation
// Getters + totalAmount() computed
// toJSON()
```

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement Installment**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

---

### Task 4: TransactionRecurrence Value Object (TDD)

**Files:**
- Create: `apps/api/src/modules/finance/domain/__tests__/TransactionRecurrence.spec.ts`
- Create: `apps/api/src/modules/finance/domain/value-objects/TransactionRecurrence.ts`

**Interface:**
```typescript
type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
// create({ frequency, startDate, endDate? }) — validates frequency, calculates nextOccurrence, rejects endDate in past
// restore(props) — no validation
// Getters: frequency, endDate, nextOccurrence
// calculateNextOccurrence(fromDate) — computes next date based on frequency
// toJSON()
```

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement TransactionRecurrence**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

---

## Chunk 2: Lightweight Entities

### Task 5: FinanceTag Entity (TDD)

**Files:**
- Create: `apps/api/src/modules/finance/domain/__tests__/FinanceTag.spec.ts`
- Create: `apps/api/src/modules/finance/domain/entities/FinanceTag.ts`

**Interface:**
```typescript
// create({ userId, name, color? }) — validates name (non-empty, max 50), id='', timestamps
// restore({ id, userId, name, color, createdAt, updatedAt })
// updateName(name), updateColor(color)
// Getters: id, userId, name, color, createdAt, updatedAt
```

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement FinanceTag**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

---

### Task 6: FinanceCategory Entity (TDD)

**Files:**
- Create: `apps/api/src/modules/finance/domain/__tests__/FinanceCategory.spec.ts`
- Create: `apps/api/src/modules/finance/domain/entities/FinanceCategory.ts`

**Interface:**
```typescript
type FinanceCategoryType = 'income' | 'expense';

// create({ userId, name, icon, color, type }) — custom category, isPredefined=false
// restore({ id, userId, name, icon, color, type, isPredefined, createdAt, updatedAt })
// static getPredefinedExpense() — returns array of predefined expense categories
// static getPredefinedIncome() — returns array of predefined income categories
// updateName(name) — throws PredefinedCategoryImmutableError if predefined
// updateIcon(icon) — throws PredefinedCategoryImmutableError if predefined
// updateColor(color) — throws PredefinedCategoryImmutableError if predefined
// ensureNotPredefined() — throws if isPredefined (for delete checks)

// Predefined expense: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Vestuário, Assinaturas, Outros
// Predefined income: Salário, Freelance, Investimentos, Outros
```

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement FinanceCategory**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

---

## Chunk 3: Core Entities

### Task 7: Account Entity (TDD)

**Files:**
- Create: `apps/api/src/modules/finance/domain/__tests__/Account.spec.ts`
- Create: `apps/api/src/modules/finance/domain/entities/Account.ts`

**Interface:**
```typescript
type AccountType = 'checking' | 'savings' | 'cash' | 'investment' | 'other';

// create({ userId, name, type, color?, icon? }) — balance=0, isArchived=false
// restore(all fields)
// updateName(name), updateColor(color), updateIcon(icon)
// credit(amount) — balance += amount (for income)
// debit(amount) — balance -= amount (for expense/invoice payment)
// adjustBalance(newBalance) — manual override
// archive() — isArchived=true
// reactivate() — isArchived=false
// ensureActive() — throws AccountArchivedError if archived
```

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement Account**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

---

### Task 8: CreditCard Entity (TDD)

**Files:**
- Create: `apps/api/src/modules/finance/domain/__tests__/CreditCard.spec.ts`
- Create: `apps/api/src/modules/finance/domain/entities/CreditCard.ts`

**Interface:**
```typescript
// create({ userId, name, limit, closingDay, dueDay, color?, icon? }) — isArchived=false
// restore(all fields)
// updateName(name), updateLimit(limit), updateClosingDay(day), updateDueDay(day)
// updateColor(color), updateIcon(icon)
// calculateAvailableLimit(openInvoiceTotal) — limit - openInvoiceTotal
// archive(), reactivate(), ensureActive()
```

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement CreditCard**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

---

## Chunk 4: Complex Entities

### Task 9: Transaction Entity (TDD)

**Files:**
- Create: `apps/api/src/modules/finance/domain/__tests__/Transaction.spec.ts`
- Create: `apps/api/src/modules/finance/domain/entities/Transaction.ts`

**Interface:**
```typescript
type TransactionType = 'income' | 'expense';

// create({ userId, type, amount, description, date, categoryId, accountId?, creditCardId?,
//          tags?, installment?, recurrence?, note? })
// Validation:
//   - amount > 0
//   - description non-empty, max 200
//   - exactly one of accountId/creditCardId (not both, not neither)
//   - income cannot be on credit card
//   - installment only on credit card
// restore(all fields)
// updateDescription, updateAmount, updateCategory, updateDate
// addTag, removeTag, updateNote
```

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement Transaction**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

---

### Task 10: Invoice Entity (TDD)

**Files:**
- Create: `apps/api/src/modules/finance/domain/__tests__/Invoice.spec.ts`
- Create: `apps/api/src/modules/finance/domain/entities/Invoice.ts`

**Interface:**
```typescript
type InvoiceStatus = 'open' | 'closed' | 'paid';

// create({ creditCardId, userId, month, closingDate, dueDate })
//   — status='open', totalAmount=0, paidAmount=0
// restore(all fields)
// updateTotalAmount(amount) — sets total (use case recalculates)
// close() — open → closed
// registerPayment(amount, accountId) — adds to paidAmount, sets accountId
//   — if paidAmount >= totalAmount → status='paid'
//   — only allowed when status='closed'
// remainingAmount — totalAmount - paidAmount
// reopen() — closed → open (for corrections)
```

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement Invoice**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

---

## Chunk 5: Remaining Entities

### Task 11: Budget Entity (TDD)

**Files:**
- Create: `apps/api/src/modules/finance/domain/__tests__/Budget.spec.ts`
- Create: `apps/api/src/modules/finance/domain/entities/Budget.ts`

**Interface:**
```typescript
// create({ userId, month, generalLimit?, categoryLimits? })
//   — validates month format, generalLimit > 0 if provided, categoryLimits validated
// restore(all fields)
// updateGeneralLimit(limit | null)
// addCategoryLimit(categoryLimit) — adds or replaces for same categoryId
// removeCategoryLimit(categoryId)
// getCategoryLimit(categoryId) — returns CategoryLimit | undefined
```

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement Budget**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

---

### Task 12: FinancialGoal Entity (TDD)

**Files:**
- Create: `apps/api/src/modules/finance/domain/__tests__/FinancialGoal.spec.ts`
- Create: `apps/api/src/modules/finance/domain/entities/FinancialGoal.ts`

**Interface:**
```typescript
type FinancialGoalStatus = 'in_progress' | 'completed' | 'failed';

// create({ userId, name, targetAmount, deadline?, accountIds? })
//   — currentAmount=0, status='in_progress'
//   — validates name (non-empty, max 200), targetAmount > 0
// restore(all fields)
// updateName(name), updateTargetAmount(amount), updateDeadline(deadline)
// addAccount(accountId), removeAccount(accountId)
// updateCurrentAmount(amount) — if >= targetAmount, auto-complete
// calculateProgress() — (currentAmount / targetAmount) * 100, capped at 100
// complete() — in_progress → completed
// markFailed() — in_progress → failed
// checkDeadline() — if deadline passed && status=in_progress → failed
```

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Verify tests fail**
- [ ] **Step 3: Implement FinancialGoal**
- [ ] **Step 4: Verify tests pass**
- [ ] **Step 5: Commit**

---

## Run Commands

```bash
# Run all finance domain tests
cd apps/api && npx jest --testPathPattern="modules/finance/domain" --verbose

# Run specific test file
cd apps/api && npx jest --testPathPattern="CategoryLimit.spec" --verbose

# Typecheck
cd apps/api && npx tsc --noEmit
```
