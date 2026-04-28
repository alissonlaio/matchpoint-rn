import { create } from 'zustand';
import { Jogador, Time, RankingJogador, RankingTime } from '../types';

interface StoreState {
  jogadores: Jogador[];
  peladaIniciada: boolean;
  jogadoresPorTime: number;
  fila: Time[];
  timeEmQuadra1: Time | null;
  timeEmQuadra2: Time | null;
  rankingJogadores: RankingJogador[];
  rankingTimes: RankingTime[];

  adicionarJogador: (nome: string) => void;
  editarJogador: (id: string, novoNome: string) => void;
  removerJogador: (id: string) => void;
  iniciarPelada: (jogadoresPorTime: number) => void;
  remontarTimes: (jogadoresPorTime: number) => void;
  registrarVitoria: (timeVencedorId: string) => void;
  substituirJogador: (timeId: string, jogadorSaiId: string, jogadorEntraId: string) => void;
  moverJogadorParaFila: (timeId: string, jogadorId: string) => void;
  moverJogadorParaFilaComSubstituto: (timeId: string, jogadorId: string) => void;
  encerrarPelada: () => void;
}

function gerarId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function salvar(state: Partial<StoreState>) {
  try {
    const atual = carregar();
    const novo = { ...atual, ...state };
    const { adicionarJogador, editarJogador, removerJogador,
      iniciarPelada, remontarTimes, registrarVitoria, substituirJogador,
      moverJogadorParaFila, moverJogadorParaFilaComSubstituto,
      encerrarPelada, ...dados } = novo as any;
    localStorage.setItem('matchpoint-storage', JSON.stringify(dados));
  } catch (e) {}
}

function carregar() {
  try {
    const raw = localStorage.getItem('matchpoint-storage');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

function paraQuadra(time: Time): Time {
  return { ...time, vitoriasSeguidas: 0, congelado: false };
}

function sincronizarRanking(rankingAtual: RankingJogador[], jogadoresAtivos: Jogador[]): RankingJogador[] {
  const novoRanking = [...rankingAtual];
  for (const j of jogadoresAtivos) {
    if (!novoRanking.find((r) => r.id === j.id)) {
      novoRanking.push({ id: j.id, nome: j.nome, vitorias: 0 });
    }
  }
  return novoRanking;
}

function atualizarRankingJogadores(ranking: RankingJogador[], vencedores: Jogador[]): RankingJogador[] {
  return ranking.map((r) =>
    vencedores.find((v) => v.id === r.id) ? { ...r, vitorias: r.vitorias + 1 } : r
  );
}

function atualizarRankingTimes(rankingTimes: RankingTime[], vencedor: Time): RankingTime[] {
  const idsVencedor = vencedor.jogadores.map(j => j.id).sort().join('|');

  const existente = rankingTimes.find((r) =>
    r.jogadores.map(j => j.id).sort().join('|') === idsVencedor
  );

  if (existente) {
    return rankingTimes.map((r) => {
      const mesmaComposicao = r.jogadores.map(j => j.id).sort().join('|') === idsVencedor;
      return mesmaComposicao ? { ...r, vitorias: r.vitorias + 1 } : r;
    });
  }

  return [...rankingTimes, {
    timeId: vencedor.id,
    numero: vencedor.numero,
    jogadores: vencedor.jogadores,
    vitorias: 1,
  }];
}

function completarTimeIncompleto(
  perdedor: Time, fila: Time[], jogadoresPorTime: number
): { perdedorFinal: Time; filaFinal: Time[] } {
  if (fila.length === 0) return { perdedorFinal: perdedor, filaFinal: fila };

  let filaWork = [...fila];
  let perdedorAtual = { ...perdedor, jogadores: [...perdedor.jogadores] };

  for (let i = filaWork.length - 1; i >= 0; i--) {
    if (filaWork[i].congelado) continue;
    if (filaWork[i].jogadores.length >= jogadoresPorTime) continue;
    if (perdedorAtual.jogadores.length === 0) break;

    const faltam = jogadoresPorTime - filaWork[i].jogadores.length;
    const qtdEmprestar = Math.min(faltam, perdedorAtual.jogadores.length);
    const emprestados = perdedorAtual.jogadores.slice(0, qtdEmprestar);

    perdedorAtual = {
      ...perdedorAtual,
      jogadores: perdedorAtual.jogadores.slice(qtdEmprestar),
    };

    filaWork[i] = {
      ...filaWork[i],
      jogadores: [...filaWork[i].jogadores, ...emprestados],
    };
  }

  return { perdedorFinal: perdedorAtual, filaFinal: filaWork };
}

const dadosSalvos = carregar();

export const useStore = create<StoreState>((set, get) => ({
  jogadores: dadosSalvos.jogadores || [],
  peladaIniciada: dadosSalvos.peladaIniciada || false,
  jogadoresPorTime: dadosSalvos.jogadoresPorTime || 4,
  fila: dadosSalvos.fila || [],
  timeEmQuadra1: dadosSalvos.timeEmQuadra1 || null,
  timeEmQuadra2: dadosSalvos.timeEmQuadra2 || null,
  rankingJogadores: dadosSalvos.rankingJogadores || [],
  rankingTimes: dadosSalvos.rankingTimes || [],

  adicionarJogador: (nome) => {
    const novoJogador: Jogador = { id: gerarId(), nome, vitorias: 0 };
    set((s) => {
      const jogadores = [...s.jogadores, novoJogador];
      const rankingJogadores = sincronizarRanking(s.rankingJogadores, jogadores);

      if (!s.peladaIniciada) {
        salvar({ jogadores, rankingJogadores });
        return { jogadores, rankingJogadores };
      }

      let novaFila = [...s.fila];
      const idxIncompleto = novaFila.findIndex(
        (t) => !t.congelado && t.jogadores.length < s.jogadoresPorTime
      );

      if (idxIncompleto >= 0) {
        novaFila[idxIncompleto] = {
          ...novaFila[idxIncompleto],
          jogadores: [...novaFila[idxIncompleto].jogadores, novoJogador],
        };
      } else {
        const proximoNumero = Math.max(
          ...novaFila.map(t => t.numero),
          s.timeEmQuadra1?.numero || 0,
          s.timeEmQuadra2?.numero || 0,
        ) + 1;
        novaFila.push({
          id: gerarId(),
          numero: proximoNumero,
          jogadores: [novoJogador],
          vitorias: 0,
          vitoriasSeguidas: 0,
          congelado: false,
        });
      }

      salvar({ jogadores, rankingJogadores, fila: novaFila });
      return { jogadores, rankingJogadores, fila: novaFila };
    });
  },

  editarJogador: (id, novoNome) => {
    set((s) => {
      const jogadores = s.jogadores.map((j) => j.id === id ? { ...j, nome: novoNome } : j);
      const rankingJogadores = s.rankingJogadores.map((r) => r.id === id ? { ...r, nome: novoNome } : r);

      const atualizarNomeNoTime = (t: Time | null): Time | null => {
        if (!t) return null;
        return {
          ...t,
          jogadores: t.jogadores.map(j => j.id === id ? { ...j, nome: novoNome } : j),
        };
      };

      const newState = {
        jogadores,
        rankingJogadores,
        timeEmQuadra1: atualizarNomeNoTime(s.timeEmQuadra1),
        timeEmQuadra2: atualizarNomeNoTime(s.timeEmQuadra2),
        fila: s.fila.map(t => atualizarNomeNoTime(t) as Time),
      };
      salvar(newState);
      return newState;
    });
  },

  removerJogador: (id) => {
    set((s) => {
      const jogadores = s.jogadores.filter((j) => j.id !== id);

      if (!s.peladaIniciada) {
        salvar({ jogadores });
        return { jogadores };
      }

      const filaCongelado = s.fila.filter(t => t.congelado);
      const filaSemCongelado = s.fila.filter(t => !t.congelado).map(t => ({
        ...t,
        jogadores: t.jogadores.filter(j => j.id !== id),
      }));

      const t1 = s.timeEmQuadra1 ? {
        ...s.timeEmQuadra1,
        jogadores: s.timeEmQuadra1.jogadores.filter(j => j.id !== id),
      } : null;

      const t2 = s.timeEmQuadra2 ? {
        ...s.timeEmQuadra2,
        jogadores: s.timeEmQuadra2.jogadores.filter(j => j.id !== id),
      } : null;

      const todosJogadores: Jogador[] = [];
      filaSemCongelado.forEach(t => todosJogadores.push(...t.jogadores));

      const novaFila: Time[] = [];
      for (let i = 0; i < filaSemCongelado.length; i++) {
        const grupo = todosJogadores.slice(i * s.jogadoresPorTime, (i + 1) * s.jogadoresPorTime);
        if (grupo.length > 0) {
          novaFila.push({ ...filaSemCongelado[i], jogadores: grupo });
        }
      }

      const filaFinal = [...filaCongelado, ...novaFila];

      const newState = {
        jogadores,
        timeEmQuadra1: t1,
        timeEmQuadra2: t2,
        fila: filaFinal,
      };
      salvar(newState);
      return newState;
    });
  },

  iniciarPelada: (jogadoresPorTime) => {
    const { jogadores } = get();
    const times: Time[] = [];
    let contador = 1;
    for (let i = 0; i < jogadores.length; i += jogadoresPorTime) {
      const grupo = jogadores.slice(i, i + jogadoresPorTime);
      if (grupo.length > 0) {
        times.push({
          id: gerarId(),
          numero: contador++,
          jogadores: grupo,
          vitorias: 0,
          vitoriasSeguidas: 0,
          congelado: false,
        });
      }
    }
    const rankingJogadores = sincronizarRanking([], jogadores);
    const newState = {
      peladaIniciada: true,
      jogadoresPorTime,
      timeEmQuadra1: times[0] || null,
      timeEmQuadra2: times[1] || null,
      fila: times.slice(2),
      rankingJogadores,
      rankingTimes: [] as RankingTime[],
    };
    salvar(newState);
    set(newState);
  },

  remontarTimes: (jogadoresPorTime) => {
    const { jogadores, rankingJogadores } = get();
    const times: Time[] = [];
    let contador = 1;
    for (let i = 0; i < jogadores.length; i += jogadoresPorTime) {
      const grupo = jogadores.slice(i, i + jogadoresPorTime);
      if (grupo.length > 0) {
        times.push({
          id: gerarId(),
          numero: contador++,
          jogadores: grupo,
          vitorias: 0,
          vitoriasSeguidas: 0,
          congelado: false,
        });
      }
    }
    const newState = {
      jogadoresPorTime,
      timeEmQuadra1: times[0] || null,
      timeEmQuadra2: times[1] || null,
      fila: times.slice(2),
      rankingTimes: [] as RankingTime[],
      rankingJogadores,
    };
    salvar(newState);
    set(newState);
  },

  registrarVitoria: (timeVencedorId) => {
    set((s) => {
      const t1 = s.timeEmQuadra1!;
      const t2 = s.timeEmQuadra2!;
      const vencedor = t1.id === timeVencedorId ? t1 : t2;
      const perdedor = { ...(t1.id === timeVencedorId ? t2 : t1), vitoriasSeguidas: 0 };

      const rankingJogadores = atualizarRankingJogadores(s.rankingJogadores, vencedor.jogadores);

      const minimoJogadores = s.jogadoresPorTime * 4;
      const temJogadoresSuficientes = s.jogadores.length >= minimoJogadores;

      const novasVitoriasSeguidas = temJogadoresSuficientes
        ? vencedor.vitoriasSeguidas + 1
        : 0;

      // ✅ Novo id a cada vitória
      const vencedorAtualizado: Time = {
        ...vencedor,
        id: gerarId(),
        vitorias: vencedor.vitorias + 1,
        vitoriasSeguidas: novasVitoriasSeguidas,
        congelado: false,
      };

      // ✅ Ranking busca por composição de jogadores
      const rankingTimes = atualizarRankingTimes(s.rankingTimes, vencedorAtualizado);

      const filaOriginal = [...s.fila];
      const timeCongeladoEsperando = filaOriginal[0]?.congelado ? filaOriginal[0] : null;
      const filaSemCongelado = filaOriginal.filter(t => !t.congelado);

      const totalTimes = 2 + filaOriginal.length;
      const deveCongelar = temJogadoresSuficientes && totalTimes >= 4 && novasVitoriasSeguidas >= 2;

      let proximoT1: Time | null = null;
      let proximoT2: Time | null = null;
      let filaAtualizada: Time[] = [];

      if (deveCongelar) {
        const timeCongelado = { ...vencedorAtualizado, congelado: true };
        const filaRestante = filaSemCongelado.slice(2);
        const { perdedorFinal, filaFinal } = completarTimeIncompleto(perdedor, filaRestante, s.jogadoresPorTime);
        proximoT1 = filaSemCongelado[0] ? paraQuadra(filaSemCongelado[0]) : null;
        proximoT2 = filaSemCongelado[1] ? paraQuadra(filaSemCongelado[1]) : null;
        filaAtualizada = [
          timeCongelado,
          ...filaFinal,
          ...(perdedorFinal.jogadores.length > 0 ? [perdedorFinal] : []),
        ];
      } else if (timeCongeladoEsperando) {
        const { perdedorFinal, filaFinal } = completarTimeIncompleto(perdedor, filaSemCongelado, s.jogadoresPorTime);
        filaAtualizada = [
          ...filaFinal,
          ...(perdedorFinal.jogadores.length > 0 ? [perdedorFinal] : []),
        ];
        proximoT1 = paraQuadra(timeCongeladoEsperando);
        proximoT2 = vencedorAtualizado;
      } else {
        const { perdedorFinal, filaFinal } = completarTimeIncompleto(perdedor, filaSemCongelado, s.jogadoresPorTime);

        let filaComTodos = [...filaFinal];
        if (perdedorFinal.jogadores.length > 0) {
          filaComTodos.push(perdedorFinal);
        }

        const idxCompleto = filaComTodos.findIndex(
          t => !t.congelado && t.jogadores.length >= s.jogadoresPorTime
        );

        if (idxCompleto >= 0) {
          proximoT2 = paraQuadra(filaComTodos[idxCompleto]);
          filaComTodos = filaComTodos.filter((_, i) => i !== idxCompleto);
        }

        proximoT1 = vencedorAtualizado;
        filaAtualizada = filaComTodos;
      }

      const newState = {
        timeEmQuadra1: proximoT1,
        timeEmQuadra2: proximoT2,
        fila: filaAtualizada,
        rankingJogadores,
        rankingTimes,
      };
      salvar(newState);
      return newState;
    });
  },

  substituirJogador: (timeId, jogadorSaiId, jogadorEntraId) => {
    set((s) => {
      const jogadorEntra = s.jogadores.find((j) => j.id === jogadorEntraId);
      if (!jogadorEntra) return s;
      const atualizarTime = (t: Time | null): Time | null => {
        if (!t || t.id !== timeId) return t;
        return {
          ...t,
          id: gerarId(),
          vitorias: 0,
          vitoriasSeguidas: 0,
          congelado: t.congelado, // ✅ preserva o estado congelado
          jogadores: t.jogadores.map((j) => j.id === jogadorSaiId ? jogadorEntra : j),
        };
      };
      const newState = {
        timeEmQuadra1: atualizarTime(s.timeEmQuadra1),
        timeEmQuadra2: atualizarTime(s.timeEmQuadra2),
        fila: s.fila.map((t) => atualizarTime(t) as Time),
      };
      salvar(newState);
      return newState;
    });
  },

  moverJogadorParaFila: (timeId, jogadorId) => {
    set((s) => {
      const jogador = s.jogadores.find((j) => j.id === jogadorId);
      if (!jogador) return s;
      const removerDoTime = (t: Time | null): Time | null => {
        if (!t || t.id !== timeId) return t;
        return {
          ...t, id: gerarId(), vitorias: 0, vitoriasSeguidas: 0, congelado: false,
          jogadores: t.jogadores.filter((j) => j.id !== jogadorId),
        };
      };
      const timeAvulso: Time = {
        id: gerarId(), numero: s.fila.length + 3,
        jogadores: [jogador], vitorias: 0, vitoriasSeguidas: 0, congelado: false,
      };
      const newState = {
        timeEmQuadra1: removerDoTime(s.timeEmQuadra1),
        timeEmQuadra2: removerDoTime(s.timeEmQuadra2),
        fila: [...s.fila.map((t) => removerDoTime(t) as Time), timeAvulso],
      };
      salvar(newState);
      return newState;
    });
  },

  moverJogadorParaFilaComSubstituto: (timeId, jogadorId) => {
    set((s) => {
      const filaSemCongelado = s.fila.filter(t => !t.congelado);
      const filaCongelado = s.fila.filter(t => t.congelado);

      const terceiroTime = filaSemCongelado[0];
      if (!terceiroTime || terceiroTime.jogadores.length === 0) return s;

      const substituto = terceiroTime.jogadores[0];
      const jogadorSai = s.jogadores.find(j => j.id === jogadorId);
      if (!jogadorSai) return s;

      const atualizarTime = (t: Time | null): Time | null => {
        if (!t || t.id !== timeId) return t;
        return {
          ...t,
          id: gerarId(),
          vitorias: 0,
          vitoriasSeguidas: 0,
          congelado: false,
          jogadores: t.jogadores.map((j) => j.id === jogadorId ? substituto : j),
        };
      };

      const todosJogadores: Jogador[] = [];
      filaSemCongelado.forEach(t => {
        t.jogadores.forEach(j => {
          if (j.id !== substituto.id) todosJogadores.push(j);
        });
      });

      todosJogadores.push(jogadorSai);

      const novaFila: Time[] = [];
      for (let i = 0; i < filaSemCongelado.length; i++) {
        const grupo = todosJogadores.slice(i * s.jogadoresPorTime, (i + 1) * s.jogadoresPorTime);
        if (grupo.length > 0) {
          novaFila.push({
            ...filaSemCongelado[i],
            jogadores: grupo,
          });
        }
      }

      const sobras = todosJogadores.slice(filaSemCongelado.length * s.jogadoresPorTime);
      if (sobras.length > 0) {
        const proximoNumero = Math.max(
          ...novaFila.map(t => t.numero),
          s.timeEmQuadra1?.numero || 0,
          s.timeEmQuadra2?.numero || 0,
        ) + 1;
        novaFila.push({
          id: gerarId(),
          numero: proximoNumero,
          jogadores: sobras,
          vitorias: 0,
          vitoriasSeguidas: 0,
          congelado: false,
        });
      }

      const filaFinal = [...filaCongelado, ...novaFila];

      const newState = {
        timeEmQuadra1: atualizarTime(s.timeEmQuadra1),
        timeEmQuadra2: atualizarTime(s.timeEmQuadra2),
        fila: filaFinal,
      };
      salvar(newState);
      return newState;
    });
  },

  encerrarPelada: () => {
    const newState = {
      peladaIniciada: false,
      jogadoresPorTime: 4,
      fila: [] as Time[],
      timeEmQuadra1: null,
      timeEmQuadra2: null,
      jogadores: [] as Jogador[],
      rankingJogadores: [] as RankingJogador[],
      rankingTimes: [] as RankingTime[],
    };
    salvar(newState);
    set(newState);
  },
}));