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
