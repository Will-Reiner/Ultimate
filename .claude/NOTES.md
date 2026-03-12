# Notas de Implementacao

## Implementacao 2026-03-09

### Resumo

Implementacao da camada de dominio do modulo Diario & Reflexao (journal) seguindo TDD.

### Detalhes

- **Erros de dominio**: 8 erros criados (`JournalEntryNotFoundError`, `InvalidJournalContentError`, `DuplicateDailyEntryError`, `InvalidMoodLevelError`, `InvalidJournalTagNameError`, `PredefinedTagImmutableError`, `DuplicateTagNameError`, `InvalidAudioError`)
- **Value Object Mood**: niveis 1-5, labels em portugues, create com validacao e restore sem validacao
- **Entidade JournalTag**: tags pre-definidas (imutaveis, 6 do sistema) e tags do usuario (editaveis/deletaveis)
- **Entidade JournalEntry (aggregate root)**: tipos daily/thought, suporte a texto e/ou audio, ciclo de vida de transcricao (pending/completed/failed), mutations para edicao com controle de updatedAt
- **Testes**: 55 testes passando — Mood (15), JournalTag (10), JournalEntry (30)
- Validacao de unicidade de daily entry ficou para o use case (requer consulta ao banco)

## Implementacao 2026-03-09 (sessao 2)

### Resumo

Implementacao completa da camada de dominio do modulo Calendario & Reunioes (calendar) seguindo TDD — 150 testes.

### Detalhes

- **Value Objects**: `EventReminder` (push, minutesBefore >= 0), `Participant` (nome obrigatorio, email opcional com validacao, status pending), `Recurrence` (daily/weekly/monthly/yearly/custom com validacoes, geracao de proxima ocorrencia, conversao bidirecional RRULE para Google Calendar)
- **Entidade Meeting**: aggregate root com participants, recurrence, reminders (ordenados por minutesBefore desc), agenda, meetingNotes, conferenceLink, ciclo cancel/reactivate, Google sync fields
- **Entidade PersonalEvent**: evento generico com recurrence, reminders, Google sync
- **Entidade TaskEvent**: vinculado a tarefa, herda titulo/projectId, complete/uncomplete com completedAt, endAt opcional (ponto no tempo)
- **Entidade HabitEvent**: local-only (sem Google sync), time HH:mm validado, daysOfWeek obrigatorio
- **Entidade StudyEvent**: vinculado a item de estudo, Google sync
- **Erros**: 10 classes de erro (InvalidEventTitle, InvalidEventTimeRange, InvalidReminderMinutes, InvalidParticipantName/Email, InvalidRecurrence, InvalidTimeFormat, InvalidDaysOfWeek, MeetingNotFound, PersonalEventNotFound)
- **Testes**: 150 testes — EventReminder (4), Participant (6), Recurrence (27), Meeting (32), PersonalEvent (13), TaskEvent (25), HabitEvent (23), StudyEvent (20)

## Implementacao 2026-03-09 (sessao 3)

### Resumo

Implementacao completa da camada de dominio do modulo Projetos & Tarefas (task) seguindo TDD — 149 testes.

### Detalhes

- **Erros de dominio**: 16 classes de erro em `TaskErrors.ts` (ProjectNotFound, InvalidProjectName, TaskNotFound, InvalidTaskTitle, InvalidPriority, InvalidTaskStatus, DuplicateTaskStatusName, ImmutableDefaultStatus, InvalidTaskTagName, DuplicateTaskTagName, InvalidTaskNoteContent, TaskNoteNotFound, InvalidTaskReminder, TaskReminderNotFound, InvalidSubtask, InvalidProjectStatusTransition, InvalidTaskStatusAssignment)
- **Value Object Priority**: niveis none/low/medium/high/urgent, weight numerico para ordenacao, isHigherThan para comparacao
- **Value Object TaskStatus**: types globais (todo/in_progress/done), status customizados por projeto, createDefaults() para os 3 fixos, isDone()
- **Entidade TaskTag**: create/restore, updateName/updateColor com updatedAt, validacao de nome
- **Entidade TaskNote**: create/restore, updateContent com updatedAt, validacao de conteudo
- **Entidade TaskReminder**: create com validacao de data futura, syncsToCalendar default true, setCalendarEventId/clearCalendarEventId (sync real fica no use case)
- **Entidade Task (aggregate root)**: criacao com defaults (status to_do, priority none), subtarefas (max 1 nivel, herda projectId), edicao completa (titulo, descricao, prioridade, status, deadline, assignee, estimativa, tags, order), validacao de status (globais + customizados do projeto), completedAt automatico ao mudar para done, isOverdue/isUpcoming, copia defensiva de tags
- **Entidade Project (aggregate root)**: criacao com defaults (status active, cor/icone padrao, 3 status globais), edicao completa, status customizados (add com validacao duplicata, remove com protecao de defaults, fallback para reatribuicao), calculateProgress, ciclo de vida (complete/archive/reactivate)
- **Domain Service TaskFilter**: filtros por prioridade, tag (single e AND), status (id e type), deadline (overdue/upcoming/sem deadline), projeto (especifico/soltas), unassigned, combine para filtros compostos, sortByPriority
- **Testes**: 149 testes — Priority (13), TaskStatus (12), TaskTag (13), TaskNote (10), TaskReminder (13), Task (45), Project (30), TaskFilter (13)

## Implementacao 2026-03-09 (sessao 4)

### Resumo

Implementacao completa da camada de dominio do modulo Biblioteca de Estudos (study) seguindo TDD — 91 testes.

### Detalhes

- **Erros de dominio**: 10 classes de erro em `StudyErrors.ts` (StudyItemNotFound, CollectionNotFound, InvalidStudyItemTitle, InvalidStudyItemType, InvalidProgress, InvalidRating, InvalidStudyStatusTransition, InvalidCollectionName, InvalidStudyNote, InvalidStudySession, InvalidStudyTagName)
- **Value Object Progress**: 3 tipos — simple (currentValue=0, sem total), percentage (0-100 com validacao), chapters (current/total com calculo %, rejeita current>total e total<=0)
- **Value Object StudyTag**: nome obrigatorio com trim, cor opcional, independente de tags de outros contextos
- **Entidade StudyItem (aggregate root)**: tipos book/course/article/podcast/video/other, lifecycle backlog→in_progress→completed|dropped, progresso auto-atualiza status (percentage 100%=completed, chapters current=total=completed), rating 1-5 so quando completed, start/complete/drop/reopen/restart, startedAt na primeira transicao, completedAt limpo ao recomecar
- **Entidade Collection**: nome obrigatorio (max 100 chars), descricao/cor/icone opcionais, order para reordenacao
- **Entidade StudyNote**: conteudo obrigatorio, vinculada a studyItemId, gerenciamento de StudyTags (add/remove), updatedAt automatico ao editar
- **Entidade StudySession**: scheduledAt + durationMinutes obrigatorios (duracao>0), status scheduled→completed|skipped, calendarEventId para integracao, reschedule para reagendar, completedAt ao completar
- **Testes**: 91 testes — Progress (10), StudyTag (6), StudyItem (35), Collection (10), StudyNote (12), StudySession (13), sem NENHUMA implementacao pendente (5 restam para use case)

## Implementacao 2026-03-09 (sessao 5)

### Resumo

Implementacao completa da camada de dominio do modulo Financas (finance) seguindo TDD — 386 testes.

### Detalhes

- **Erros de dominio**: 31 classes de erro em `FinanceErrors.ts` — Account (4: NotFound, InvalidName, InvalidType, InvalidAmount, Archived), CreditCard (5: NotFound, InvalidName, InvalidLimit, InvalidClosingDay, InvalidDueDay, Archived), Transaction (4: NotFound, InvalidAmount, InvalidDescription, InvalidSource, InvalidType), Installment (1), TransactionRecurrence (1), Invoice (3: NotFound, InvalidStatusTransition, InvalidPayment), Budget (3: NotFound, InvalidLimit, InvalidMonth, InvalidCategoryLimit), FinancialGoal (4: NotFound, InvalidName, InvalidAmount, InvalidStatusTransition), FinanceTag (1), FinanceCategory (3: InvalidName, InvalidType, PredefinedImmutable)
- **Value Object CategoryLimit**: create com validacao (limit > 0), restore sem validacao, toJSON
- **Value Object Installment**: totalInstallments/currentInstallment/installmentAmount/parentTransactionId, validacoes cruzadas (current <= total), totalAmount computado, toJSON
- **Value Object TransactionRecurrence**: frequencias daily/weekly/monthly/yearly, startDate/endDate (strings YYYY-MM-DD), calculateNextOccurrence com calculo UTC por frequencia, endDate deve ser posterior a startDate, toJSON
- **Entidade FinanceTag**: nome obrigatorio (max 50 chars, trimmed), cor opcional, updateName/updateColor com updatedAt
- **Entidade FinanceCategory**: categorias customizadas (create com validacao) e predefinidas (9 despesa: Alimentacao, Transporte, Moradia, Saude, Educacao, Lazer, Vestuario, Assinaturas, Outros; 4 receita: Salario, Freelance, Investimentos, Outros — todas com acentos corretos), guardPredefined impede edicao/exclusao de predefinidas, ensureNotPredefined para delete checks
- **Entidade Account**: tipos checking/savings/cash/investment/other, balance comeca em 0, credit(amount)/debit(amount) com validacao > 0 usando InvalidAccountAmountError, adjustBalance(newBalance) para override manual, archive/reactivate/ensureActive, saldo pode ficar negativo
- **Entidade CreditCard**: nome/limit/closingDay(1-31)/dueDay(1-31), calculateAvailableLimit(openInvoiceTotal) = limit - total, archive/reactivate/ensureActive, rejeita dias fracionarios
- **Entidade Transaction**: tipo income/expense, exatamente uma origem (accountId XOR creditCardId), receita nao pode ser em cartao, installment so em cartao, descricao max 200 chars, tags como string[] com copia defensiva, mutations completas (description, amount, category, date, tags, note)
- **Entidade Invoice**: status open→closed→paid, totalAmount atualizado por use case via updateTotalAmount(), close() so de open, registerPayment(amount, accountId) so quando closed (acumula paidAmount, auto-paid quando >= totalAmount), reopen() so de closed (reseta paidAmount/paidWithAccountId), remainingAmount computado
- **Entidade Budget**: mes formato YYYY-MM validado por regex, generalLimit > 0 opcional, categoryLimits (array de CategoryLimit VOs) com add/replace por categoryId e remove, getCategoryLimit, copia defensiva no getter
- **Entidade FinancialGoal**: nome max 200, targetAmount > 0, status in_progress→completed|failed, updateCurrentAmount auto-completa quando >= targetAmount, calculateProgress (0-100 capped), complete/markFailed so de in_progress, checkDeadline auto-fail se deadline passado, accountIds com dedup e copia defensiva
- **Testes**: 386 testes — CategoryLimit (6), Installment (13), TransactionRecurrence (17), FinanceTag (20), FinanceCategory (37), Account (49), CreditCard (64), Transaction (50), Invoice (30), Budget (35), FinancialGoal (65)

## Implementacao 2026-03-11

### Resumo

Implementacao completa do modulo Dashboard — 7 domain services, 11 value objects, 6 inputs e testes para todos os contextos.

### Detalhes

- **Domain Services (7)**: `HomeDashboardService` (resumo do dia), `HabitDashboardService` (taxa de conclusao, streaks, heatmap, creditos, vicios, goals), `TaskDashboardService` (overdue, upcoming, distribuicao por prioridade, progresso por projeto), `CalendarDashboardService` (agregacao de eventos, densidade mensal, eventos por dia), `FinanceDashboardService` (saldos, despesas/receitas, orcamento), `StudyDashboardService` (overview por status e progresso), `JournalDashboardService` (grafico de humor, tendencias, frequencia de tags)
- **Value Objects (11)**: `HomeSummary`, `HabitHeatmap`, `ViceMetrics`, `CompletionRate`, `CalendarDensity`, `TaskDistribution`, `ProjectProgress`, `StudyOverview`, `MoodGraph`, `MoodTrend`, `TagFrequency`
- **Inputs (6)**: tipos de entrada para cada contexto (Habit, Task, Calendar, Finance, Study, Journal)
- **Testes**: cobertura completa com specs para todos os 7 services e VOs relevantes
- Removido plano de financas obsoleto (`2026-03-09-financas-domain.md`)
