# Dashboard & Metas — Mapeamento Completo

## Entidades próprias: nenhuma
    O Dashboard é uma camada de leitura que agrega dados dos outros contextos. Metas vivem dentro de cada contexto (Goal no Hábito, Progress no StudyItem, deadline no Project).

## Dashboards por Contexto

### Dashboard Geral (Home)
    Resumo do dia: hábitos pendentes, tarefas do dia, próximos eventos
    Streaks ativos (top 3 hábitos)
    Humor recente (últimos 7 dias do Diário)
    Progresso geral (% de hábitos feitos hoje, % tarefas concluídas na semana)

### Dashboard de Hábitos
    Taxa de conclusão por período (dia, semana, mês)
    Streaks atuais e maiores de cada hábito
    Heatmap de consistência (quais dias completou)
    Créditos acumulados por hábito
    Para vícios: dias sem recaída, frequência de recaídas ao longo do tempo
    Progresso das Goals vinculadas

### Dashboard de Projetos & Tarefas
    Tarefas atrasadas (deadline < hoje)
    Tarefas próximas (deadline nos próximos 7 dias)
    Progresso por projeto (% concluído)
    Distribuição por prioridade (quantas urgent, high, etc.)
    Tarefas sem deadline e sem assignee
    Tempo estimado vs tempo restante

### Dashboard de Calendário
    Visão semanal/mensal de todos os eventos agregados
    Densidade do dia (quantos eventos/reuniões)
    Tempo livre estimado no dia

### Dashboard de Diário
    Gráfico de humor ao longo do tempo
    Frequência de entradas (quantos dias registrou)
    Tags mais usadas
    Streaks de escrita (dias consecutivos com entrada)

### Dashboard de Estudos
    Itens em progresso com % de cada
    Sessões de estudo completadas vs agendadas
    Itens no backlog
    Rating médio dos concluídos
    Notas recentes
    
### Dashboard Financeiro
    com base nos parametros financeiros defina oq podemos colocar

## Regras de Negócio (formato TDD)

describe('Dashboard Geral')

  describe('resumo do dia')
    it('deve listar hábitos pendentes do dia (due e não completados)')
    it('deve listar tarefas com deadline para hoje')
    it('deve listar próximos 3 eventos do calendário')
    it('deve mostrar humor da entrada diária de hoje (se existir)')

  describe('métricas rápidas')
    it('deve calcular % de hábitos completados hoje')
    it('deve calcular % de tarefas concluídas na semana')
    it('deve mostrar top 3 streaks ativos')

describe('Dashboard de Hábitos')

  describe('taxa de conclusão')
    it('deve calcular taxa diária (completados / due no dia)')
    it('deve calcular taxa semanal (completados / due na semana)')
    it('deve calcular taxa mensal')
    it('deve separar por hábito individual')
    it('deve ignorar hábitos pausados e arquivados')

  describe('heatmap')
    it('deve retornar mapa de dias com status (completo, parcial, falhou, não-due)')
    it('deve cobrir período configurável (30, 60, 90 dias)')

  describe('vícios')
    it('deve calcular dias sem recaída por vício')
    it('deve mostrar frequência de recaídas por semana/mês')
    it('deve mostrar gatilhos mais comuns (quando tracking habilitado)')

describe('Dashboard de Projetos & Tarefas')

  describe('tarefas')
    it('deve retornar tarefas atrasadas ordenadas por deadline')
    it('deve retornar tarefas com deadline nos próximos N dias')
    it('deve retornar contagem por prioridade')
    it('deve retornar tarefas sem deadline')
    it('deve retornar tarefas sem assignee')

  describe('projetos')
    it('deve calcular progresso de cada projeto ativo')
    it('deve ordenar projetos por deadline mais próxima')
    it('deve ignorar projetos arquivados')

describe('Dashboard de Calendário')

  describe('visão agregada')
    it('deve agregar Meeting, PersonalEvent, TaskEvent, HabitEvent e StudyEvent')
    it('deve ordenar por horário de início')
    it('deve calcular eventos por dia na visão mensal')
    it('deve identificar dias com alta densidade (>5 eventos)')

describe('Dashboard de Diário')

  describe('humor')
    it('deve retornar gráfico de humor dos últimos N dias')
    it('deve calcular média de humor por semana')
    it('deve identificar tendência (melhorando, piorando, estável)')

  describe('frequência')
    it('deve calcular streak de escrita (dias consecutivos com entrada)')
    it('deve retornar % de dias com entrada no mês')

  describe('tags')
    it('deve retornar tags mais usadas ordenadas por frequência')

describe('Dashboard de Estudos')

  describe('progresso')
    it('deve listar itens in_progress com percentual de cada')
    it('deve contar itens no backlog')
    it('deve contar itens concluídos no período')

  describe('sessões')
    it('deve calcular taxa de sessões completadas vs agendadas')
    it('deve calcular tempo total de estudo no período')

  describe('rating')
    it('deve calcular rating médio dos itens concluídos')
