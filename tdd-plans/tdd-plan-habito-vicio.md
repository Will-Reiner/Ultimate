# Hábitos & Vícios — Mapeamento Completo

## Entidades

### Habit (Aggregate Root)
    - id
    - userId
    - name (obrigatório, max 100 chars)
    - description (opcional)
    - type: "build" | "quit" (imutável após criação)
    - trackingMode: "boolean" | "quantitative"
    - dailyTarget: número (obrigatório se quantitative — ex: 8)
    - targetUnit: string (obrigatório se quantitative — ex: "copos")
    - frequency: Frequency (value object)
    - goal: Goal | null (value object opcional)
    - category: Category | null
    - tags: Tag[]
    - reminders: Reminder[]
    - status: "active" | "paused" | "archived"
    - trackRelapseIntensity: boolean (só relevante pra quit)
    - trackRelapseTrigger: boolean (só relevante pra quit)
    - createdAt
    - updatedAt

### HabitEntry
    - id
    - habitId
    - date (YYYY-MM-DD)
    - entryType: "check_in" | "relapse"
    - value: número (1 pra boolean, N pra quantitative)
    - note: string | null
    - intensity: número 1-10 | null (só relapse, quando habilitado)
    - trigger: string | null (só relapse, quando habilitado)
    - createdAt

### Streak (pode ser calculado ou materializado)
    - habitId
    - currentStreak: número
    - longestStreak: número
    - creditDays: número (banco de dias extras)
    - lastCalculatedDate

## Value Objects

### Frequency
    - type: "daily" | "weekly" | "specific_days" | "interval"
    - timesPerWeek: número (quando weekly)
    - days: number[] (quando specific_days — 0=dom a 6=sáb)
    - everyNDays: número (quando interval)

### Goal
    - type: "deadline" | "ongoing"
    - targetValue: número
    - targetUnit: string
    - deadline: Date | null (só pra deadline)
    - status: "in_progress" | "completed" | "failed"

### Category (pré-definida pelo sistema)
    - id
    - name
    - icon
    - color

### Tag (criada pelo usuário)
    - id
    - userId
    - name
    - color

### Reminder
    - id
    - habitId
    - time: string (HH:mm)

## Regras de Negócio (formato TDD)

describe('Habit')

  describe('criação')
    it('deve criar um hábito do tipo "build" com campos obrigatórios')
    it('deve criar um hábito do tipo "quit" com campos obrigatórios')
    it('deve rejeitar nome vazio')
    it('deve rejeitar nome com mais de 100 caracteres')
    it('deve fazer trim no nome')
    it('não deve permitir alterar o type após criação')
    it('deve exigir frequência na criação')
    it('deve exigir tracking mode na criação (boolean ou quantitative)')
    it('deve exigir unidade e meta diária se tracking mode for quantitative')
    it('deve permitir criar sem categoria, tags e lembretes')
    it('deve iniciar com status "active"')
    it('deve permitir criar hábito tipo "quit" com tracking de intensidade habilitado')
    it('deve permitir criar hábito tipo "quit" com tracking de gatilho habilitado')
    it('deve permitir criar hábito tipo "quit" sem tracking de intensidade e gatilho')
    it('deve ignorar trackRelapseIntensity e trackRelapseTrigger para tipo "build"')

  describe('edição')
    it('deve atualizar o nome')
    it('deve rejeitar nome inválido na atualização')
    it('deve atualizar a frequência')
    it('deve atualizar a meta diária (quantitativo)')
    it('deve atualizar categoria')
    it('deve remover categoria (setar null)')
    it('deve adicionar tag')
    it('deve remover tag')
    it('deve atualizar lembretes (lista de horários)')
    it('deve permitir lembrete com múltiplos horários')
    it('deve permitir lembrete sem nenhum horário')
    it('não deve permitir alterar o type (build/quit)')

  describe('ciclo de vida')
    it('deve pausar um hábito ativo')
    it('deve arquivar um hábito ativo')
    it('deve reativar um hábito pausado')
    it('deve reativar um hábito arquivado')
    it('deve manter histórico ao arquivar')
    it('não deve cobrar check-ins enquanto pausado')

describe('HabitEntry')

  describe('check-in (type build)')
    it('deve registrar check-in booleano (valor 1)')
    it('deve registrar check-in quantitativo com valor > 0')
    it('deve rejeitar check-in com valor <= 0')
    it('deve permitir check-in em qualquer dia (inclusive não-due)')
    it('não deve permitir check-in duplicado no mesmo dia')
    it('deve permitir nota opcional no check-in')
    it('deve permitir check-in sem nota')

  describe('recaída (type quit)')
    it('deve registrar recaída em qualquer dia')
    it('deve permitir múltiplas recaídas no mesmo dia')
    it('deve registrar intensidade quando hábito tem tracking de intensidade habilitado')
    it('deve rejeitar intensidade quando hábito não tem tracking habilitado')
    it('deve validar intensidade entre 1 e 10')
    it('deve registrar gatilho quando hábito tem tracking de gatilho habilitado')
    it('deve rejeitar gatilho quando hábito não tem tracking habilitado')
    it('deve permitir nota opcional na recaída')

describe('Streak')

  describe('hábito build - cálculo básico')
    it('deve retornar 0 quando não há check-ins')
    it('deve retornar 1 para um único dia completado')
    it('deve contar dias due consecutivos completados')
    it('deve quebrar streak quando dia due não foi completado')
    it('deve ignorar dias não-due no cálculo (não quebram streak)')

  describe('hábito build - crédito por dia extra')
    it('deve acumular crédito quando check-in é feito em dia não-due')
    it('deve usar crédito para cobrir um dia due sem check-in')
    it('deve consumir apenas 1 crédito por dia due perdido')
    it('deve acumular múltiplos créditos com múltiplos dias extras')
    it('não deve quebrar streak se há crédito disponível')
    it('deve quebrar streak se não há crédito suficiente')

  describe('hábito build - quantitativo')
    it('não deve contar check-in incompleto como completado para streak')
    it('deve contar check-in que atinge meta diária como completado')

  describe('vício quit')
    it('deve contar dias consecutivos sem recaída')
    it('deve zerar streak ao registrar recaída')
    it('deve recomeçar contagem após recaída')

  describe('streak geral')
    it('deve calcular maior streak histórico')
    it('deve congelar streak ao pausar hábito')
    it('deve zerar streak ao reativar (se usuário escolher reset)')
    it('deve continuar streak ao reativar (se usuário escolher freeze)')

describe('Goal')

  describe('meta com prazo (deadline)')
    it('deve criar meta com valor alvo, unidade e data limite')
    it('deve calcular progresso como % do target')
    it('deve marcar como completada ao atingir target antes do prazo')
    it('deve marcar como falhada ao passar do prazo sem atingir')
    it('deve rejeitar deadline no passado na criação')

  describe('meta contínua (ongoing)')
    it('deve criar meta sem prazo')
    it('deve calcular progresso acumulativo')
    it('deve marcar como completada ao atingir target')
    it('nunca deve marcar como falhada (não tem prazo)')

describe('Frequency')

  describe('daily')
    it('deve marcar todos os dias como due')

  describe('weekly')
    it('deve aceitar timesPerWeek entre 1 e 7')
    it('deve rejeitar timesPerWeek fora do intervalo')

  describe('specific_days')
    it('deve marcar apenas dias selecionados como due')
    it('deve rejeitar lista vazia')
    it('deve deduplicar e ordenar dias')
    it('deve rejeitar valores fora de 0-6')

  describe('interval')
    it('deve marcar como due a cada N dias a partir da criação')
    it('deve rejeitar intervalo <= 0')

describe('Category')
    it('deve ter id, nome, ícone e cor')
    it('deve ser pré-definida (não criada pelo usuário)')

describe('Tag')
    it('deve criar tag com nome e cor')
    it('deve rejeitar nome vazio')
    it('deve rejeitar nome duplicado para o mesmo usuário')

describe('Reminder')
    it('deve criar lembrete com horário válido')
    it('deve rejeitar horário inválido')
    it('deve notificar apenas em dias due')
    it('deve suportar múltiplos horários por hábito')
    it('deve permitir hábito sem nenhum lembrete')

