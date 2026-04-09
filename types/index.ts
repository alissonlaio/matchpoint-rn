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
  fila: Time[]; // todos os times na fila
  timeEmQuadra1: Time | null; // time A jogando
  timeEmQuadra2: Time | null; // time B jogando
}