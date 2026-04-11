export interface Jogador {
  id: string;
  nome: string;
  vitorias: number;
}

export interface Time {
  id: string;
  numero: number;
  jogadores: Jogador[];
  vitorias: number;
  vitoriasSeguidas: number;
  congelado: boolean;
}

export interface RankingJogador {
  id: string;
  nome: string;
  vitorias: number;
}

export interface RankingTime {
  timeId: string;
  numero: number;
  jogadores: Jogador[];
  vitorias: number;
}

export interface PeladaState {
  iniciada: boolean;
  jogadoresPorTime: number;
  fila: Time[];
  timeEmQuadra1: Time | null;
  timeEmQuadra2: Time | null;
}

// ─── Modo Campeonato ───────────────────────────────────────

export interface TimeCampeonato {
  id: string;
  nome: string;
  jogadores: Jogador[];
}

export interface Confronto {
  id: string;
  timeA: TimeCampeonato;
  timeB: TimeCampeonato;
  placarA: number | null;
  placarB: number | null;
  vencedorId: string | null;
  fase: 'grupo' | 'semi' | 'terceiro' | 'final';
}

export interface Campeonato {
  id: string;
  nome: string;
  times: TimeCampeonato[];
  confrontos: Confronto[];
  fase: 'grupo' | 'eliminatorio' | 'encerrado';
  criadoEm: number;
}