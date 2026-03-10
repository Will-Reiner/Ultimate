# Diário & Reflexão — Mapeamento Completo

## Entidades

### JournalEntry (Aggregate Root)
    id
    userId
    type: "daily" (diário do dia) | "thought" (pensamento solto)
    date: string (YYYY-MM-DD)
    textContent: string | null
    audioUrl: string | null
    audioTranscription: string | null
    audioDurationSeconds: number | null
    mood: Mood | null (value object — opcional)
    tags: JournalTag[]
    createdAt
    updatedAt

## Value Objects

### Mood
    level: 1 | 2 | 3 | 4 | 5 (mapeia pra 5 emojis: péssimo, ruim, neutro, bom, ótimo)

### JournalTag
    id
    name: string
    isPredefined: boolean (true = sistema, false = criada pelo usuário)
    userId: string | null (null se pré-definida)

### Tags pré-definidas do sistema
    Pensamentos
    Ideias
    Emoções
    Gratidão
    Desabafo
    Reflexão

## Regras de Negócio (formato TDD)

describe('JournalEntry')

  describe('criação')
    it('deve criar entrada tipo "daily" com texto')
    it('deve criar entrada tipo "daily" com áudio')
    it('deve criar entrada tipo "daily" com texto e áudio')
    it('deve criar entrada tipo "thought" com texto')
    it('deve criar entrada tipo "thought" com áudio')
    it('deve rejeitar entrada sem texto e sem áudio (precisa de pelo menos um)')
    it('deve permitir múltiplas entradas "thought" no mesmo dia')
    it('deve permitir apenas uma entrada "daily" por dia')
    it('deve rejeitar segunda entrada "daily" no mesmo dia')
    it('deve permitir criar sem mood')
    it('deve permitir criar sem tags')
    it('deve registrar data e hora de criação')

  describe('áudio')
    it('deve armazenar URL do áudio')
    it('deve registrar duração em segundos')
    it('deve gerar transcrição automaticamente')
    it('deve iniciar com audioTranscription = null até transcrição completar')
    it('deve atualizar audioTranscription quando transcrição finalizar')

  describe('edição')
    it('deve atualizar texto')
    it('deve atualizar mood')
    it('deve adicionar tag')
    it('deve remover tag')
    it('deve permitir substituir áudio (regravar)')
    it('deve limpar transcrição ao substituir áudio')
    it('deve atualizar updatedAt ao editar')

  describe('exclusão')
    it('deve permitir excluir entrada')
    it('deve remover áudio associado ao excluir')

describe('Mood')

  describe('validação')
    it('deve criar mood com level entre 1 e 5')
    it('deve rejeitar level menor que 1')
    it('deve rejeitar level maior que 5')
    it('deve rejeitar level não inteiro')
    it('deve mapear level 1 para emoji "péssimo"')
    it('deve mapear level 2 para emoji "ruim"')
    it('deve mapear level 3 para emoji "neutro"')
    it('deve mapear level 4 para emoji "bom"')
    it('deve mapear level 5 para emoji "ótimo"')

describe('JournalTag')

  describe('tags pré-definidas')
    it('deve existir tags pré-definidas do sistema')
    it('tags pré-definidas devem ter isPredefined = true')
    it('tags pré-definidas devem ter userId = null')
    it('não deve permitir excluir tag pré-definida')
    it('não deve permitir editar tag pré-definida')

  describe('tags do usuário')
    it('deve criar tag com nome obrigatório')
    it('deve rejeitar nome vazio')
    it('deve rejeitar nome duplicado para o mesmo usuário')
    it('tags do usuário devem ter isPredefined = false')
    it('tags do usuário devem ter userId preenchido')
    it('deve permitir excluir tag do usuário')
    it('deve desvincular tag das entradas ao excluir (não deleta entradas)')

describe('Transcrição de Áudio')

  describe('fluxo')
    it('deve iniciar transcrição ao salvar entrada com áudio')
    it('deve atualizar entrada com transcrição quando concluída')
    it('deve marcar erro se transcrição falhar')
    it('deve permitir retry de transcrição falha')
    it('transcrição deve estar disponível para a IA gerar insights')

describe('Integração com IA')

  describe('dados disponíveis')
    it('deve expor texto + transcrição para o contexto de IA')
    it('deve expor mood para correlação com outros contextos')
    it('deve expor tags para categorização de temas')
    it('deve expor data para análise temporal')
    it('deve respeitar entradas por período (semana, mês) nos relatórios')
