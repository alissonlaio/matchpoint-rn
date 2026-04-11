import { create } from 'zustand';
import { Campeonato, Confronto, TimeCampeonato } from '../types';

interface ClassificacaoItem {
  time: TimeCampeonato;
  pontos: number;
  vitorias: number;
  derrotas: number;
  saldo: number;
  feitos: number;
  sofridos: number;
  jogos: number;
}

interface CampeonatoStore {
  campeonato: Campeonato | null;
  criarCampeonato: (nome: string, times: TimeCampeonato[]) => void;
  registrarResultado: (confrontoId: string, placarA: number, placarB: number) => void;
  encerrarCampeonato: () => void;
  calcularClassificacao: () => ClassificacaoItem[];
}

function gerarId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function salvar(campeonato: Campeonato | null) {
  try {
    localStorage.setItem('matchpoint-campeonato', JSON.stringify(campeonato));
  } catch (e) {}
}

function carregar(): Campeonato | null {
  try {
    const raw = localStorage.getItem('matchpoint-campeonato');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

function gerarConfrontosGrupo(times: TimeCampeonato[]): Confronto[] {
  const confrontos: Confronto[] = [];
  for (let i = 0; i < times.length; i++) {
    for (let j = i + 1; j < times.length; j++) {
      confrontos.push({
        id: gerarId(),
        timeA: times[i],
        timeB: times[j],
        placarA: null,
        placarB: null,
        vencedorId: null,
        fase: 'grupo',
      });
    }
  }
  return confrontos;
}

function calcularClassificacaoFn(campeonato: Campeonato): ClassificacaoItem[] {
  const mapa: Record<string, ClassificacaoItem> = {};
  campeonato.times.forEach((t) => {
    mapa[t.id] = { time: t, pontos: 0, vitorias: 0, derrotas: 0, saldo: 0, feitos: 0, sofridos: 0, jogos: 0 };
  });
  campeonato.confrontos
    .filter((c) => c.fase === 'grupo' && c.vencedorId)
    .forEach((c) => {
      const pA = c.placarA!;
      const pB = c.placarB!;
      const perdedorId = c.timeA.id === c.vencedorId ? c.timeB.id : c.timeA.id;
      mapa[c.vencedorId!].pontos += 3;
      mapa[c.vencedorId!].vitorias += 1;
      mapa[perdedorId].derrotas += 1;
      mapa[c.timeA.id].feitos += pA;
      mapa[c.timeA.id].sofridos += pB;
      mapa[c.timeB.id].feitos += pB;
      mapa[c.timeB.id].sofridos += pA;
      mapa[c.timeA.id].jogos += 1;
      mapa[c.timeB.id].jogos += 1;
    });
  Object.values(mapa).forEach((item) => {
    item.saldo = item.feitos - item.sofridos;
  });
  return Object.values(mapa).sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    return b.saldo - a.saldo;
  });
}

function gerarFaseEliminatoria(campeonato: Campeonato): Confronto[] {
  const classificacao = calcularClassificacaoFn(campeonato);
  const top4 = classificacao.slice(0, 4);
  return [
    {
      id: gerarId(),
      timeA: top4[0].time,
      timeB: top4[3].time,
      placarA: null, placarB: null, vencedorId: null,
      fase: 'semi',
    },
    {
      id: gerarId(),
      timeA: top4[1].time,
      timeB: top4[2].time,
      placarA: null, placarB: null, vencedorId: null,
      fase: 'semi',
    },
  ];
}

export { calcularClassificacaoFn };
export type { ClassificacaoItem };

export const useCampeonatoStore = create<CampeonatoStore>((set, get) => ({
  campeonato: carregar(),

  criarCampeonato: (nome, times) => {
    const campeonato: Campeonato = {
      id: gerarId(),
      nome,
      times,
      confrontos: gerarConfrontosGrupo(times),
      fase: 'grupo',
      criadoEm: Date.now(),
    };
    salvar(campeonato);
    set({ campeonato });
  },

  registrarResultado: (confrontoId, placarA, placarB) => {
    set((s) => {
      if (!s.campeonato) return s;

      const vencedorId = placarA > placarB
        ? s.campeonato.confrontos.find(c => c.id === confrontoId)?.timeA.id
        : s.campeonato.confrontos.find(c => c.id === confrontoId)?.timeB.id;

      let confrontos = s.campeonato.confrontos.map((c) =>
        c.id === confrontoId ? { ...c, placarA, placarB, vencedorId: vencedorId! } : c
      );

      let fase = s.campeonato.fase;

      // Verifica se fase de grupo terminou
      const confrontosGrupo = confrontos.filter(c => c.fase === 'grupo');
      const grupoCompleto = confrontosGrupo.every(c => c.vencedorId);

      if (grupoCompleto && fase === 'grupo') {
        const campTemp = { ...s.campeonato, confrontos };
        const semis = gerarFaseEliminatoria(campTemp);
        confrontos = [...confrontos, ...semis];
        fase = 'eliminatorio';
      }

      // Verifica se as semis terminaram → gera finais
      if (fase === 'eliminatorio') {
        const semis = confrontos.filter(c => c.fase === 'semi');
        const semisCompletas = semis.length === 2 && semis.every(c => c.vencedorId);
        const finaisJaExistem = confrontos.some(c => c.fase === 'final' || c.fase === 'terceiro');

        if (semisCompletas && !finaisJaExistem) {
          const semi1 = semis[0];
          const semi2 = semis[1];
          const venc1 = semi1.vencedorId === semi1.timeA.id ? semi1.timeA : semi1.timeB;
          const perd1 = semi1.vencedorId === semi1.timeA.id ? semi1.timeB : semi1.timeA;
          const venc2 = semi2.vencedorId === semi2.timeA.id ? semi2.timeA : semi2.timeB;
          const perd2 = semi2.vencedorId === semi2.timeA.id ? semi2.timeB : semi2.timeA;

          confrontos = [
            ...confrontos,
            {
              id: gerarId(),
              timeA: perd1, timeB: perd2,
              placarA: null, placarB: null, vencedorId: null,
              fase: 'terceiro',
            },
            {
              id: gerarId(),
              timeA: venc1, timeB: venc2,
              placarA: null, placarB: null, vencedorId: null,
              fase: 'final',
            },
          ];
        }

        // Verifica se tudo terminou
        const todasFinais = confrontos.filter(c => c.fase === 'final' || c.fase === 'terceiro');
        if (todasFinais.length === 2 && todasFinais.every(c => c.vencedorId)) {
          fase = 'encerrado';
        }
      }

      const campeonato = { ...s.campeonato, confrontos, fase };
      salvar(campeonato);
      return { campeonato };
    });
  },

  encerrarCampeonato: () => {
    salvar(null);
    set({ campeonato: null });
  },

  calcularClassificacao: () => {
    const { campeonato } = get();
    if (!campeonato) return [];
    return calcularClassificacaoFn(campeonato);
  },
}));