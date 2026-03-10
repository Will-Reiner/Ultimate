# Biblioteca de Estudos — Mapeamento Completo

## Entidades

### StudyItem (Aggregate Root)
    id
    userId
    title (obrigatório, max 200 chars)
    description (opcional)
    type: "book" | "course" | "article" | "podcast" | "video" | "other"
    url: string | null
    progress: Progress (value object)
    status: "backlog" | "in_progress" | "completed" | "dropped"
    rating: number | null (1-5, dado pelo usuário ao concluir)
    collectionId: string | null
    notes: StudyNote[]
    studySessions: StudySession[]
    startedAt: Date | null
    completedAt: Date | null
    createdAt
    updatedAt

### Collection (Estante/Coleção)
    id
    userId
    name (obrigatório, max 100 chars)
    description (opcional)
    color: string | null
    icon: string | null
    order: number
    createdAt
    updatedAt

### StudyNote (Anotação — serve tanto pra texto livre quanto pra insight)
    id
    studyItemId
    content: string (texto)
    tags: StudyTag[]
    createdAt
    updatedAt

### StudySession (Sessão agendada — gera StudyEvent no calendário)
    id
    studyItemId
    userId
    scheduledAt: DateTime
    durationMinutes: number
    status: "scheduled" | "completed" | "skipped"
    calendarEventId: string | null
    completedAt: Date | null
    createdAt

## Value Objects

### Progress
    type: "simple" | "percentage" | "chapters"
    currentValue: number
    totalValue: number | null (só pra chapters)

### StudyTag
    id
    userId
    name: string
    color: string | null

## Regras de Negócio (formato TDD)

describe('StudyItem')

  describe('criação')
    it('deve criar item com título e tipo obrigatórios')
    it('deve rejeitar título vazio')
    it('deve rejeitar título com mais de 200 caracteres')
    it('deve fazer trim no título')
    it('deve aceitar tipos: book, course, article, podcast, video, other')
    it('deve rejeitar tipo inválido')
    it('deve iniciar com status "backlog"')
    it('deve iniciar com progresso zerado')
    it('deve permitir criar sem coleção e URL')
    it('deve iniciar com rating = null')
    it('deve iniciar com startedAt e completedAt = null')

  describe('progresso - simple')
    it('deve atualizar status para "in_progress" ao iniciar')
    it('deve registrar startedAt ao mudar para "in_progress" pela primeira vez')
    it('deve atualizar status para "completed" ao concluir')
    it('deve registrar completedAt ao concluir')

  describe('progresso - percentage')
    it('deve criar progresso com currentValue entre 0 e 100')
    it('deve rejeitar valor fora de 0-100')
    it('deve atualizar status para "in_progress" quando currentValue > 0')
    it('deve atualizar status para "completed" quando currentValue = 100')

  describe('progresso - chapters')
    it('deve criar progresso com currentValue e totalValue')
    it('deve rejeitar totalValue <= 0')
    it('deve rejeitar currentValue > totalValue')
    it('deve rejeitar currentValue < 0')
    it('deve calcular porcentagem como currentValue / totalValue')
    it('deve atualizar status para "completed" quando currentValue = totalValue')

  describe('edição')
    it('deve atualizar título e descrição')
    it('deve atualizar tipo')
    it('deve atualizar URL')
    it('deve atualizar progresso')
    it('deve mover para outra coleção')
    it('deve remover de coleção (setar null)')
    it('deve adicionar rating ao concluir (1-5)')
    it('deve rejeitar rating fora de 1-5')
    it('deve permitir rating apenas quando status = "completed"')

  describe('ciclo de vida')
    it('deve marcar como "dropped" (abandonado)')
    it('deve reabrir item dropped (volta pra in_progress)')
    it('deve manter progresso ao abandonar')
    it('deve permitir recomeçar item completed')
    it('deve limpar completedAt ao recomeçar')

describe('Collection')

  describe('criação')
    it('deve criar coleção com nome obrigatório')
    it('deve rejeitar nome vazio')
    it('deve rejeitar nome com mais de 100 caracteres')
    it('deve permitir criar sem descrição, cor e ícone')

  describe('edição')
    it('deve atualizar nome e descrição')
    it('deve atualizar cor e ícone')
    it('deve reordenar coleção')

  describe('exclusão')
    it('deve permitir excluir coleção')
    it('deve desvincular itens ao excluir (não deleta itens)')

describe('StudyNote')

  describe('criação')
    it('deve criar nota com conteúdo obrigatório')
    it('deve rejeitar conteúdo vazio')
    it('deve vincular ao item de estudo')
    it('deve permitir criar com tags')
    it('deve permitir criar sem tags')

  describe('edição')
    it('deve atualizar conteúdo')
    it('deve adicionar tag')
    it('deve remover tag')
    it('deve atualizar updatedAt ao editar')

  describe('exclusão')
    it('deve permitir excluir nota')

describe('StudySession')

  describe('criação')
    it('deve criar sessão com data/hora e duração obrigatórios')
    it('deve rejeitar duração <= 0')
    it('deve vincular ao item de estudo')
    it('deve iniciar com status "scheduled"')
    it('deve gerar StudyEvent no calendário automaticamente')
    it('deve armazenar calendarEventId do evento gerado')

  describe('completar')
    it('deve marcar sessão como "completed"')
    it('deve registrar completedAt')
    it('deve permitir marcar como "skipped"')

  describe('sincronização com calendário')
    it('deve atualizar StudyEvent ao editar sessão')
    it('deve remover StudyEvent ao excluir sessão')
    it('deve atualizar sessão quando StudyEvent é editado pelo calendário')
    it('deve remover sessão quando StudyEvent é deletado pelo calendário')

  describe('exclusão')
    it('deve permitir excluir sessão')
    it('deve remover StudyEvent associado')

describe('Progress')

  describe('simple')
    it('deve criar com currentValue = 0')
    it('deve não ter totalValue')

  describe('percentage')
    it('deve criar com currentValue entre 0 e 100')
    it('deve rejeitar valor negativo')
    it('deve rejeitar valor acima de 100')

  describe('chapters')
    it('deve criar com currentValue e totalValue')
    it('deve calcular percentual corretamente')
    it('deve rejeitar totalValue <= 0')
    it('deve rejeitar currentValue negativo')
    it('deve rejeitar currentValue > totalValue')

describe('StudyTag')
    it('deve criar tag com nome obrigatório')
    it('deve rejeitar nome vazio')
    it('deve rejeitar nome duplicado para o mesmo usuário')
    it('tags de estudo devem ser independentes das tags de outros contextos')
