# Projetos & Tarefas — Mapeamento Completo

## Entidades

### Project (Aggregate Root)
    id
    userId
    name (obrigatório, max 100 chars)
    description (opcional, texto livre)
    objective (opcional, texto livre — o "porquê" do projeto)
    color: string (hex)
    icon: string (emoji ou identificador)
    status: "active" | "archived" | "completed"
    deadline: Date | null
    customStatuses: TaskStatus[] (status customizados para este projeto, além dos globais)
    createdAt
    updatedAt

### Task (Aggregate Root)
    id
    userId
    projectId: string | null (pode ser tarefa solta)
    parentTaskId: string | null (se for subtarefa — apenas 1 nível)
    title (obrigatório, max 200 chars)
    description (opcional, texto livre)
    status: TaskStatus (value object)
    priority: Priority (value object)
    deadline: Date | null
    assigneeId: string | null (userId — colaborativo no futuro)
    estimatedMinutes: number | null
    tags: TaskTag[]
    reminders: TaskReminder[]
    notes: TaskNote[]
    completedAt: Date | null
    order: number (posição na lista dentro do projeto/contexto)
    createdAt
    updatedAt

### TaskNote
    id
    taskId
    content: string (texto)
    createdAt
    updatedAt

### TaskReminder
    id
    taskId
    remindAt: Date (data + hora específica)
    syncsToCalendar: boolean (default true — cria evento no calendário)
    calendarEventId: string | null (referência ao evento criado)
    createdAt

## Value Objects

### Priority
    level: "none" | "low" | "medium" | "high" | "urgent"

### TaskStatus
    id
    name: string (ex: "to_do", "in_progress", "done")
    type: "todo" | "in_progress" | "done" (mapeia pra categorias fixas globais)
    color: string
    isDefault: boolean (status fixos globais = true, customizados = false)

### TaskTag (separada das tags de Hábitos)
    id
    userId
    name
    color

### Status Globais Fixos (sempre existem)
    "To Do" (type: "todo")
    "In Progress" (type: "in_progress")
    "Done" (type: "done")
* Status customizados por projeto mapeiam para um dos 3 types. Ex: "Em Review" → type "in_progress", "Cancelado" → type "done".

## Regras de Negócio (formato TDD)

describe('Project')

  describe('criação')
    it('deve criar projeto com nome obrigatório')
    it('deve rejeitar nome vazio')
    it('deve rejeitar nome com mais de 100 caracteres')
    it('deve fazer trim no nome')
    it('deve permitir criar sem descrição, objetivo e deadline')
    it('deve iniciar com status "active"')
    it('deve ter cor e ícone padrão se não informados')
    it('deve iniciar com status globais fixos (to_do, in_progress, done)')

  describe('edição')
    it('deve atualizar nome, descrição e objetivo')
    it('deve atualizar cor e ícone')
    it('deve atualizar deadline')
    it('deve remover deadline (setar null)')

  describe('status customizados')
    it('deve adicionar status customizado vinculado a um type global')
    it('deve rejeitar status com nome vazio')
    it('deve rejeitar status com nome duplicado no mesmo projeto')
    it('deve remover status customizado')
    it('não deve permitir remover status globais fixos')
    it('deve reatribuir tarefas ao remover status customizado (para o default do mesmo type)')

  describe('progresso')
    it('deve calcular progresso como % de tarefas com type "done"')
    it('deve retornar 0% quando não há tarefas')
    it('deve considerar apenas tarefas diretas (não subtarefas)')
    it('deve atualizar progresso ao completar tarefa')

  describe('ciclo de vida')
    it('deve concluir projeto')
    it('deve arquivar projeto')
    it('deve reativar projeto arquivado')
    it('deve reativar projeto concluído')
    it('deve manter todas as tarefas ao arquivar')

describe('Task')

  describe('criação')
    it('deve criar tarefa com título obrigatório')
    it('deve rejeitar título vazio')
    it('deve rejeitar título com mais de 200 caracteres')
    it('deve fazer trim no título')
    it('deve iniciar com status "to_do"')
    it('deve iniciar com prioridade "none"')
    it('deve permitir criar sem projeto (tarefa solta)')
    it('deve permitir criar vinculada a um projeto')
    it('deve permitir criar sem deadline, assignee e estimativa')
    it('deve permitir criar com tags')

  describe('subtarefa')
    it('deve criar subtarefa vinculada a uma tarefa pai')
    it('deve herdar o projectId da tarefa pai')
    it('não deve permitir subtarefa de subtarefa (máx 1 nível)')
    it('subtarefa deve ter todos os atributos de uma tarefa')
    it('deve rejeitar criar subtarefa se pai já é subtarefa')

  describe('edição')
    it('deve atualizar título e descrição')
    it('deve atualizar prioridade')
    it('deve atualizar status')
    it('deve atualizar deadline')
    it('deve atualizar assignee')
    it('deve atualizar estimativa de tempo')
    it('deve mover tarefa para outro projeto')
    it('deve desvincular tarefa de projeto (tornar solta)')
    it('deve adicionar tag')
    it('deve remover tag')
    it('deve reordenar tarefa (alterar order)')

  describe('status')
    it('deve aceitar status globais fixos')
    it('deve aceitar status customizados do projeto')
    it('deve rejeitar status customizado de outro projeto')
    it('deve registrar completedAt ao mudar para status type "done"')
    it('deve limpar completedAt ao sair de status type "done"')
    it('tarefa solta deve aceitar apenas status globais')

  describe('completar')
    it('deve marcar como concluída (status type "done")')
    it('deve registrar data de conclusão')
    it('deve permitir reabrir tarefa concluída')
    it('ao reabrir, deve limpar data de conclusão')

  describe('deadline')
    it('deve identificar tarefa como atrasada (deadline < hoje e status != done)')
    it('deve identificar tarefa como próxima (deadline nos próximos 3 dias)')
    it('não deve marcar como atrasada se já concluída')

describe('TaskNote')

  describe('criação')
    it('deve criar nota com conteúdo obrigatório')
    it('deve rejeitar conteúdo vazio')
    it('deve vincular à tarefa')
    it('deve registrar data de criação')

  describe('edição')
    it('deve atualizar conteúdo')
    it('deve atualizar updatedAt ao editar')

  describe('exclusão')
    it('deve permitir excluir nota')

describe('TaskReminder')

  describe('criação')
    it('deve criar lembrete com data/hora futura')
    it('deve rejeitar data/hora no passado')
    it('deve vincular à tarefa')
    it('deve criar com syncsToCalendar = true por padrão')

  describe('sincronização com calendário')
    it('deve gerar calendarEventId quando syncsToCalendar = true')
    it('deve não gerar calendarEventId quando syncsToCalendar = false')
    it('deve atualizar evento no calendário ao editar lembrete')
    it('deve remover evento no calendário ao excluir lembrete')

  describe('exclusão')
    it('deve permitir excluir lembrete')
    it('deve limpar referência do calendário ao excluir')

describe('Priority')
    it('deve aceitar valores: none, low, medium, high, urgent')
    it('deve rejeitar valor inválido')
    it('deve ordenar: urgent > high > medium > low > none')

describe('TaskStatus')
    it('deve criar status com nome, type e cor')
    it('deve rejeitar nome vazio')
    it('deve mapear para um type global (todo, in_progress, done)')
    it('deve distinguir status global (isDefault=true) de customizado')

describe('TaskTag')
    it('deve criar tag com nome e cor')
    it('deve rejeitar nome vazio')
    it('deve rejeitar nome duplicado para o mesmo usuário')
    it('tags de tarefas devem ser independentes das tags de hábitos')

describe('Filtros Inteligentes')

  describe('filtro por prioridade')
    it('deve retornar tarefas com prioridade específica')
    it('deve ordenar por prioridade (urgent primeiro)')

  describe('filtro por tag')
    it('deve retornar tarefas que contenham a tag')
    it('deve suportar filtro por múltiplas tags (AND)')

  describe('filtro por status')
    it('deve retornar tarefas com status específico')
    it('deve filtrar por type do status (todas "in_progress")')

  describe('filtro por deadline')
    it('deve retornar tarefas atrasadas')
    it('deve retornar tarefas com deadline nos próximos N dias')
    it('deve retornar tarefas sem deadline')

  describe('filtro por projeto')
    it('deve retornar tarefas de um projeto específico')
    it('deve retornar tarefas soltas (sem projeto)')

  describe('filtro combinado')
    it('deve combinar múltiplos filtros (ex: atrasadas + alta prioridade)')
    it('deve retornar tarefas sem assignee')
