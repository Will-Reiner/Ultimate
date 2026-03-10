# Calendário & Reuniões — Mapeamento Completo

* OBS: Criar um serviço GoogleCalendarSyncService (um port/adapter) que encapsula toda essa lógica. O domínio não sabe que Google existe — ele só emite domain events tipo MeetingUpdated, TaskEventDeleted. O sync service escuta esses eventos e propaga pro Google. Na direção inversa, o sync service recebe o webhook, processa, e chama os use cases do domínio normalmente.

## Entidades

### Meeting (Reunião/Compromisso — criada direto no calendário)
    id
    userId
    title (obrigatório, max 200 chars)
    description (opcional, texto livre)
    startAt: DateTime
    endAt: DateTime
    isAllDay: boolean
    location: string | null (endereço físico ou link de call)
    conferenceLink: string | null (manual agora, Google Meet no futuro)
    participants: Participant[]
    agenda: string | null (pauta — texto livre)
    meetingNotes: string | null (ata/notas pós-reunião)
    recurrence: Recurrence | null (value object)
    reminders: EventReminder[]
    status: "scheduled" | "cancelled"
    color: string | null
    googleEventId: string | null
    syncWithGoogle: boolean (default true)
    createdAt
    updatedAt

### PersonalEvent (Evento pessoal genérico — dentista, viagem, aniversário)
    id
    userId
    title (obrigatório, max 200 chars)
    description (opcional)
    startAt: DateTime
    endAt: DateTime
    isAllDay: boolean
    location: string | null
    recurrence: Recurrence | null
    reminders: EventReminder[]
    color: string | null
    googleEventId: string | null
    syncWithGoogle: boolean (default true)
    createdAt
    updatedAt

### TaskEvent (gerado automaticamente a partir de TaskReminder)
    id
    userId
    taskId: string (referência à tarefa de origem)
    projectId: string | null (herdado da tarefa)
    title: string (herdado da tarefa)
    startAt: DateTime
    endAt: DateTime | null (pode ser só um ponto no tempo)
    reminders: EventReminder[]
    googleTaskId: string | null
    syncWithGoogle: boolean (default true)
    createdAt
    updatedAt

### HabitEvent (gerado automaticamente a partir de Habit Reminders — só local)
    id
    userId
    habitId: string (referência ao hábito de origem)
    title: string (herdado do hábito)
    time: string (HH:mm — horário do lembrete)
    daysOfWeek: number[] (derivado da frequência do hábito)
    createdAt
    updatedAt

### StudyEvent (gerado a partir da Biblioteca de Estudos)
    id
    userId
    studyItemId: string (referência ao curso/leitura)
    title: string
    startAt: DateTime
    endAt: DateTime
    reminders: EventReminder[]
    googleEventId: string | null
    syncWithGoogle: boolean (default true)
    createdAt
    updatedAt

## Value Objects

### Participant
    name: string (obrigatório)
    email: string | null
    status: "pending" | "accepted" | "declined" (preparado pro futuro de convites)

### Recurrence
    type: "daily" | "weekly" | "monthly" | "yearly" | "custom"
    interval: number (a cada N — ex: a cada 2 semanas)
    daysOfWeek: number[] | null (pra weekly — quais dias)
    dayOfMonth: number | null (pra monthly — qual dia do mês)
    endType: "never" | "after_count" | "until_date"
    endCount: number | null (se after_count)
    endDate: Date | null (se until_date)

### EventReminder
    id
    type: "push" (agora) — preparado pra "email" no futuro
    minutesBefore: number (ex: 10, 30, 60, 1440 pra 1 dia antes)

## Regras de Negócio (formato TDD)

describe('Meeting')

  describe('criação')
    it('deve criar reunião com título, início e fim obrigatórios')
    it('deve rejeitar título vazio')
    it('deve rejeitar título com mais de 200 caracteres')
    it('deve rejeitar endAt antes de startAt')
    it('deve permitir criar como all-day (ignora horário, usa só data)')
    it('deve iniciar com status "scheduled"')
    it('deve permitir criar sem participantes, local e agenda')
    it('deve permitir criar sem recorrência')
    it('deve permitir criar com múltiplos lembretes')
    it('deve iniciar com syncWithGoogle = true')
    it('deve iniciar com googleEventId = null')

  describe('edição')
    it('deve atualizar título e descrição')
    it('deve atualizar horários (startAt e endAt)')
    it('deve atualizar local e link de conferência')
    it('deve atualizar agenda (pauta)')
    it('deve adicionar/editar notas da reunião (ata)')
    it('deve atualizar recorrência')
    it('deve remover recorrência (setar null)')

  describe('participantes')
    it('deve adicionar participante com nome')
    it('deve adicionar participante com nome e email')
    it('deve remover participante')
    it('deve rejeitar participante com nome vazio')
    it('deve iniciar participante com status "pending"')

  describe('cancelamento')
    it('deve cancelar reunião (status "cancelled")')
    it('deve permitir reativar reunião cancelada')

  describe('recorrência')
    it('deve gerar próximas ocorrências baseado na regra')
    it('deve respeitar endCount quando tipo é "after_count"')
    it('deve respeitar endDate quando tipo é "until_date"')
    it('deve gerar indefinidamente quando endType é "never"')
    it('deve permitir editar apenas uma ocorrência')
    it('deve permitir editar todas as ocorrências futuras')

  describe('lembretes')
    it('deve adicionar múltiplos lembretes (ex: 10min e 1h antes)')
    it('deve rejeitar minutesBefore negativo')
    it('deve remover lembrete')
    it('deve ordenar lembretes por minutesBefore (maior primeiro)')

describe('PersonalEvent')

  describe('criação')
    it('deve criar evento com título, início e fim obrigatórios')
    it('deve rejeitar título vazio')
    it('deve rejeitar endAt antes de startAt')
    it('deve permitir criar como all-day')
    it('deve permitir criar com recorrência')
    it('deve permitir criar com múltiplos lembretes')
    it('deve permitir criar sem local')
    it('deve iniciar com syncWithGoogle = true')
    it('deve iniciar com googleEventId = null')

  describe('edição')
    it('deve atualizar título, descrição e local')
    it('deve atualizar horários')
    it('deve atualizar recorrência')
    it('deve atualizar lembretes')

  describe('exclusão')
    it('deve permitir excluir evento')
    it('deve permitir excluir apenas uma ocorrência de evento recorrente')
    it('deve permitir excluir todas as ocorrências futuras')

describe('TaskEvent')

  describe('criação')
    it('deve criar evento vinculado a uma tarefa')
    it('deve herdar título da tarefa')
    it('deve herdar projectId da tarefa')
    it('deve ter referência ao taskId de origem')
    it('deve iniciar com syncWithGoogle = true')
    it('deve iniciar com googleTaskId = null')

  describe('sincronização bidirecional com app')
    it('deve atualizar título quando tarefa é renomeada')
    it('deve atualizar horário quando editado pelo calendário')
    it('deve propagar alteração de horário de volta pro TaskReminder')
    it('deve remover evento quando TaskReminder é excluído')
    it('deve remover evento quando tarefa é excluída')
    it('deve marcar evento como concluído quando tarefa é concluída')

describe('HabitEvent')

  describe('criação')
    it('deve criar evento vinculado a um hábito')
    it('deve herdar título do hábito')
    it('deve gerar ocorrências baseado na frequência do hábito')
    it('deve respeitar dias due do hábito')
    it('não deve ter campos de sincronização Google')

  describe('sincronização bidirecional com app')
    it('deve atualizar quando hábito muda de frequência')
    it('deve atualizar quando lembrete do hábito muda de horário')
    it('deve propagar alteração de horário de volta pro Habit Reminder')
    it('deve remover evento quando hábito é pausado')
    it('deve recriar evento quando hábito é reativado')
    it('deve remover evento quando hábito é arquivado')

describe('StudyEvent')

  describe('criação')
    it('deve criar evento vinculado a um item de estudo')
    it('deve herdar título do item de estudo')
    it('deve ter horário de início e fim')
    it('deve iniciar com syncWithGoogle = true')
    it('deve iniciar com googleEventId = null')

  describe('sincronização bidirecional com app')
    it('deve atualizar quando editado pelo calendário')
    it('deve propagar alteração de volta pro contexto de Biblioteca')
    it('deve remover evento quando item de estudo é excluído')

describe('Google Calendar Sync - Meeting')
    it('deve gerar googleEventId ao sincronizar pela primeira vez')
    it('deve atualizar evento no Google ao editar reunião localmente')
    it('deve atualizar reunião local ao receber mudança do Google')
    it('deve remover evento no Google ao cancelar reunião')
    it('deve não sincronizar quando syncWithGoogle é false')
    it('deve mapear participantes para attendees do Google')
    it('deve converter Recurrence para RRULE do Google')
    it('deve converter RRULE do Google para Recurrence local')

describe('Google Calendar Sync - PersonalEvent')
    it('deve gerar googleEventId ao sincronizar pela primeira vez')
    it('deve atualizar evento no Google ao editar localmente')
    it('deve atualizar evento local ao receber mudança do Google')
    it('deve remover evento no Google ao excluir localmente')
    it('deve não sincronizar quando syncWithGoogle é false')
    it('deve sincronizar eventos all-day corretamente')
    it('deve converter recorrência para RRULE e vice-versa')

describe('Google Tasks Sync - TaskEvent')
    it('deve gerar googleTaskId ao sincronizar pela primeira vez')
    it('deve mapear título da tarefa para title do Google Tasks')
    it('deve mapear deadline para due do Google Tasks')
    it('deve marcar como completed no Google ao concluir tarefa')
    it('deve reabrir tarefa local ao desmarcar completed no Google')
    it('deve atualizar tarefa local ao receber mudança do Google')
    it('deve não sincronizar quando syncWithGoogle é false')
    it('deve remover task no Google ao excluir TaskEvent')

describe('Google Calendar Sync - StudyEvent')
    it('deve gerar googleEventId ao sincronizar pela primeira vez')
    it('deve atualizar evento no Google ao editar localmente')
    it('deve atualizar evento local ao receber mudança do Google')
    it('deve não sincronizar quando syncWithGoogle é false')

describe('Recurrence')

  describe('validação')
    it('deve criar recorrência diária')
    it('deve criar recorrência semanal com dias específicos')
    it('deve criar recorrência mensal com dia do mês')
    it('deve criar recorrência anual')
    it('deve criar recorrência customizada com intervalo')
    it('deve rejeitar intervalo <= 0')
    it('deve rejeitar daysOfWeek vazio para tipo weekly')
    it('deve rejeitar dayOfMonth fora de 1-31')
    it('deve rejeitar endCount <= 0')
    it('deve rejeitar endDate no passado')

  describe('geração de ocorrências')
    it('deve calcular próxima ocorrência para cada tipo')
    it('deve respeitar intervalo (ex: a cada 2 semanas)')
    it('deve parar de gerar quando endCount atingido')
    it('deve parar de gerar quando endDate ultrapassada')

  describe('conversão RRULE')
    it('deve converter recorrência diária para RRULE')
    it('deve converter recorrência semanal para RRULE com BYDAY')
    it('deve converter recorrência mensal para RRULE com BYMONTHDAY')
    it('deve converter RRULE do Google para Recurrence local')
    it('deve preservar INTERVAL na conversão')
    it('deve preservar COUNT e UNTIL na conversão')

describe('EventReminder')
    it('deve criar lembrete com minutesBefore válido')
    it('deve rejeitar minutesBefore negativo')
    it('deve aceitar 0 (lembrete no momento do evento)')
    it('deve aceitar valores grandes (ex: 1440 = 1 dia antes)')

describe('Participant')
    it('deve criar com nome obrigatório')
    it('deve rejeitar nome vazio')
    it('deve permitir email opcional')
    it('deve iniciar com status "pending"')
    it('deve validar formato de email quando fornecido')
