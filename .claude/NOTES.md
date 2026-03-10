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
