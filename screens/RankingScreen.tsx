import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { useStore } from '../store/useStore';
import { Screen } from '../App';

interface Props {
  navegar: (s: Screen) => void;
}

export default function RankingScreen({ navegar }: Props) {
  const { rankingJogadores, rankingTimes } = useStore();

  const jogadoresOrdenados = [...rankingJogadores].sort((a, b) => b.vitorias - a.vitorias);
  const timesOrdenados = [...rankingTimes].sort((a, b) => b.vitorias - a.vitorias);
  const top3 = timesOrdenados.slice(0, 3);
  const restante = timesOrdenados.slice(3);

  const obterPodio = (lista: { vitorias: number }[]) => {
    const niveis: number[] = [];
    for (const item of lista) { if (!niveis.includes(item.vitorias)) niveis.push(item.vitorias); }
    niveis.sort((a, b) => b - a);
    return niveis;
  };

  const medalha = (vitorias: number, lista: { vitorias: number }[]) => {
    const niveis = obterPodio(lista);
    if (vitorias === niveis[0]) return '🥇';
    if (vitorias === niveis[1]) return '🥈';
    if (vitorias === niveis[2]) return '🥉';
    return '';
  };

  const corPosicao = (vitorias: number, lista: { vitorias: number }[]) => {
    const niveis = obterPodio(lista);
    if (vitorias === niveis[0]) return '#f5c000';
    if (vitorias === niveis[1]) return '#94a3b8';
    if (vitorias === niveis[2]) return '#cd7c2f';
    return '#ffffff';
  };

  const gruposJogadores = (() => {
    const grupos: { vitorias: number; jogadores: typeof jogadoresOrdenados }[] = [];
    for (const j of jogadoresOrdenados) {
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.vitorias === j.vitorias) { ultimo.jogadores.push(j); }
      else { grupos.push({ vitorias: j.vitorias, jogadores: [j] }); }
    }
    return grupos;
  })();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navegar('home')}>
          <Text style={styles.btnVoltarText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ranking</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {top3.length > 0 && (
          <View style={styles.podioCard}>
            <Text style={styles.podioTitulo}>🏐 RANKING SEMANAL 🏐</Text>
            {top3.map((time, idx) => (
              <View key={time.timeId}>
                <View style={[styles.podioItem, idx === 0 && styles.podioItemOuro]}>
                  <View style={styles.podioLeft}>
                    <Text style={styles.podioMedalha}>{medalha(time.vitorias, timesOrdenados)}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.podioTimeNome, { color: corPosicao(time.vitorias, timesOrdenados) }]}>
                        Time {time.numero}
                      </Text>
                      <View style={styles.podioJogadores}>
                        {time.jogadores.map((j) => (
                          <Text key={j.id} style={styles.podioJogadorChip} numberOfLines={1} ellipsizeMode="tail">{j.nome}</Text>
                        ))}
                      </View>
                    </View>
                  </View>
                  <View style={[styles.vitoriasBox, { backgroundColor: corPosicao(time.vitorias, timesOrdenados) }]}>
                    <Text style={styles.vitoriasNum}>{time.vitorias}</Text>
                    <Text style={styles.vitoriasLabel}>VITÓRIAS</Text>
                  </View>
                </View>
                {idx === 0 && (<Text style={styles.campeaoLabel}>🏆 CAMPEÃO</Text>)}
              </View>
            ))}
            <Text style={styles.podioFrase}>"Na quadra ou fora dela, sempre em equipe! 🏐"</Text>
            <Text style={styles.podioRodape}>🏐 MATCHPOINT V.T. 🏐</Text>
          </View>
        )}

        {restante.map((time, idx) => (
          <View key={time.timeId} style={styles.filaCard}>
            <Text style={styles.filaPos}>{idx + 4}º</Text>
            <View style={styles.filaInfo}>
              <Text style={styles.filaTimeNome}>Time {time.numero}</Text>
              <View style={styles.filaJogadores}>
                {time.jogadores.map((j) => (
                  <Text key={j.id} style={styles.filaJogadorChip} numberOfLines={1} ellipsizeMode="tail">{j.nome}</Text>
                ))}
              </View>
            </View>
            <View style={styles.filaVitorias}>
              <Text style={styles.filaVitoriasNum}>{time.vitorias}</Text>
              <Text style={styles.filaVitoriasLabel}>⭐</Text>
            </View>
          </View>
        ))}

        <View style={styles.rankingJogadoresCard}>
          <View style={styles.rankingJogadoresHeader}>
            <Text style={styles.rankingJogadoresTitulo}>👤 Ranking de Jogadores</Text>
          </View>
          <View style={styles.rankingJogadoresColunas}>
            <Text style={styles.colunaPos}>#</Text>
            <Text style={styles.colunaNome}>Jogador</Text>
            <Text style={styles.colunaVitorias}>Vitórias</Text>
          </View>
          {jogadoresOrdenados.length === 0 ? (
            <Text style={styles.vazio}>Nenhum dado ainda.</Text>
          ) : (
            (() => {
              let posAtual = 1;
              return gruposJogadores.map((grupo) => {
                const pos = posAtual;
                posAtual += grupo.jogadores.length;
                const med = medalha(grupo.vitorias, jogadoresOrdenados);
                const cor = corPosicao(grupo.vitorias, jogadoresOrdenados);
                return (
                  <View key={`grupo-${grupo.vitorias}-${pos}`} style={styles.rankingJogadorRow}>
                    <Text style={[styles.rankingPos, { color: cor }]}>{pos}º</Text>
                    <Text style={styles.rankingNome}>{med}{med ? ' ' : ''}{grupo.jogadores.map(j => j.nome).join(' · ')}</Text>
                    <View style={styles.rankingVitoriasBox}>
                      <Text style={styles.rankingVitoriasNum}>{grupo.vitorias}</Text>
                    </View>
                  </View>
                );
              });
            })()
          )}
        </View>

        <View style={styles.bottomBtns}>
          <TouchableOpacity style={styles.btnTimes} onPress={() => navegar('pelada')}>
            <Text style={styles.btnTimesText}>⚽ Lista de Times</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050d1a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#071020',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
    borderBottomWidth: 2, borderBottomColor: '#f5c000',
  },
  btnVoltar: { borderWidth: 1, borderColor: '#f5c000', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  btnVoltarText: { color: '#f5c000', fontWeight: 'bold' },
  headerTitle: { color: '#f5c000', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  content: { padding: 16, paddingBottom: 40 },
  podioCard: { borderWidth: 2, borderColor: '#f5c000', borderRadius: 16, backgroundColor: '#0c1a35', padding: 16, marginBottom: 16 },
  podioTitulo: { color: '#f5c000', fontWeight: 'bold', fontSize: 16, textAlign: 'center', marginBottom: 16, letterSpacing: 1 },
  podioItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#1a3a6e', marginBottom: 8 },
  podioItemOuro: { borderWidth: 1, borderColor: '#f5c000' },
  podioLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  podioMedalha: { fontSize: 28 },
  podioTimeNome: { fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  podioJogadores: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  podioJogadorChip: { backgroundColor: '#050d1a', color: '#94a3b8', fontSize: 12, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, maxWidth: 100 },
  vitoriasBox: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', minWidth: 60 },
  vitoriasNum: { color: '#050d1a', fontWeight: 'bold', fontSize: 20 },
  vitoriasLabel: { color: '#050d1a', fontSize: 9, fontWeight: 'bold' },
  campeaoLabel: { color: '#f5c000', textAlign: 'center', fontWeight: 'bold', fontSize: 13, letterSpacing: 2, marginTop: 4, marginBottom: 8 },
  podioFrase: { color: '#3a5070', fontStyle: 'italic', textAlign: 'center', fontSize: 12, marginTop: 16, marginBottom: 8 },
  podioRodape: { color: '#f5c000', textAlign: 'center', fontWeight: 'bold', fontSize: 13, letterSpacing: 2 },
  filaCard: { backgroundColor: '#0c1a35', borderRadius: 10, borderWidth: 1, borderColor: '#1a3a6e', padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  filaPos: { color: '#f5c000', fontWeight: 'bold', fontSize: 18, width: 36 },
  filaInfo: { flex: 1 },
  filaTimeNome: { color: '#fff', fontWeight: 'bold', fontSize: 14, borderWidth: 1, borderColor: '#f5c000', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 6 },
  filaJogadores: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  filaJogadorChip: { color: '#94a3b8', fontSize: 13, maxWidth: 100 },
  filaVitorias: { alignItems: 'center' },
  filaVitoriasNum: { color: '#fff', fontWeight: 'bold', fontSize: 14, backgroundColor: '#00c853', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  filaVitoriasLabel: { fontSize: 14 },
  rankingJogadoresCard: { borderWidth: 1, borderColor: '#f5c000', borderRadius: 16, backgroundColor: '#0c1a35', marginTop: 16, overflow: 'hidden' },
  rankingJogadoresHeader: { backgroundColor: '#1a3a6e', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f5c000' },
  rankingJogadoresTitulo: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  rankingJogadoresColunas: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1a3a6e' },
  colunaPos: { color: '#f5c000', fontWeight: 'bold', width: 40 },
  colunaNome: { color: '#f5c000', fontWeight: 'bold', flex: 1 },
  colunaVitorias: { color: '#f5c000', fontWeight: 'bold', width: 70, textAlign: 'right' },
  rankingJogadorRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a3a6e' },
  rankingPos: { fontWeight: 'bold', fontSize: 14, width: 40 },
  rankingNome: { color: '#fff', fontSize: 14, flex: 1 },
  rankingVitoriasBox: { backgroundColor: '#00c853', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  rankingVitoriasNum: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  vazio: { color: '#3a5070', textAlign: 'center', padding: 20 },
  bottomBtns: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnTimes: { flex: 1, borderWidth: 1, borderColor: '#f5c000', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnTimesText: { color: '#f5c000', fontWeight: 'bold', fontSize: 15 },
});