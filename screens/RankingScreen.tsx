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

  const medalha = (pos: number) => {
    if (pos === 0) return '🥇';
    if (pos === 1) return '🥈';
    if (pos === 2) return '🥉';
    return '';
  };

  const corPosicao = (pos: number) => {
    if (pos === 0) return '#f5a623';
    if (pos === 1) return '#94a3b8';
    if (pos === 2) return '#cd7c2f';
    return '#f5a623';
  };

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

        {/* Ranking de Times - Pódio top 3 */}
        {top3.length > 0 && (
          <View style={styles.podioCard}>
            <Text style={styles.podioTitulo}>🏐 RANKING SEMANAL 🏐</Text>

            {top3.map((time, idx) => (
              <View key={time.timeId}>
                <View style={[
                  styles.podioItem,
                  idx === 0 && styles.podioItemOuro,
                ]}>
                  <View style={styles.podioLeft}>
                    <Text style={styles.podioMedalha}>{medalha(idx)}</Text>
                    <View>
                      <Text style={[styles.podioTimeNome, { color: corPosicao(idx) }]}>
                        Time {time.numero}
                      </Text>
                      <View style={styles.podioJogadores}>
                        {time.jogadores.map((j) => (
                          <Text key={j.id} style={styles.podioJogadorChip}>{j.nome}</Text>
                        ))}
                      </View>
                    </View>
                  </View>
                  <View style={[styles.vitoriasBox, { backgroundColor: corPosicao(idx) }]}>
                    <Text style={styles.vitoriasNum}>{time.vitorias}</Text>
                    <Text style={styles.vitoriasLabel}>VITÓRIAS</Text>
                  </View>
                </View>
                {idx === 0 && (
                  <Text style={styles.campeaoLabel}>🏆 CAMPEÃO</Text>
                )}
              </View>
            ))}

            <Text style={styles.podioFrase}>"Na quadra ou fora dela, sempre em equipe! 🏐"</Text>
            <Text style={styles.podioRodape}>🏐 MATCHPOINT V.T. 🏐</Text>
          </View>
        )}

        {/* Restante dos times */}
        {restante.map((time, idx) => (
          <View key={time.timeId} style={styles.filaCard}>
            <Text style={styles.filaPos}>{idx + 4}º</Text>
            <View style={styles.filaInfo}>
              <Text style={styles.filaTimeNome}>Time {time.numero}</Text>
              <View style={styles.filaJogadores}>
                {time.jogadores.map((j) => (
                  <Text key={j.id} style={styles.filaJogadorChip}>{j.nome}</Text>
                ))}
              </View>
            </View>
            <View style={styles.filaVitorias}>
              <Text style={styles.filaVitoriasNum}>{time.vitorias}</Text>
              <Text style={styles.filaVitoriasLabel}>⭐</Text>
            </View>
          </View>
        ))}

        {/* Ranking de Jogadores */}
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
            jogadoresOrdenados.map((j, idx) => (
              <View key={j.id} style={styles.rankingJogadorRow}>
                <Text style={[styles.rankingPos, { color: corPosicao(idx) }]}>
                  {idx + 1}º
                </Text>
                <Text style={styles.rankingNome}>
                  {medalha(idx)} {j.nome}
                </Text>
                <View style={styles.rankingVitoriasBox}>
                  <Text style={styles.rankingVitoriasNum}>{j.vitorias}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Botões bottom */}
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
  container: { flex: 1, backgroundColor: '#0a1628' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#0d1f3c',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
  },
  btnVoltar: {
    borderWidth: 1, borderColor: '#f5a623', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  btnVoltarText: { color: '#f5a623', fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  podioCard: {
    borderWidth: 2, borderColor: '#f5a623', borderRadius: 16,
    backgroundColor: '#0d1f3c', padding: 16, marginBottom: 16,
  },
  podioTitulo: {
    color: '#f5a623', fontWeight: 'bold', fontSize: 16,
    textAlign: 'center', marginBottom: 16, letterSpacing: 1,
  },
  podioItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 12, borderRadius: 10,
    backgroundColor: '#1a2f4a', marginBottom: 8,
  },
  podioItemOuro: { borderWidth: 1, borderColor: '#f5a623' },
  podioLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  podioMedalha: { fontSize: 28 },
  podioTimeNome: { fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  podioJogadores: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  podioJogadorChip: {
    backgroundColor: '#0a1628', color: '#94a3b8', fontSize: 12,
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3,
  },
  vitoriasBox: {
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
    alignItems: 'center', minWidth: 60,
  },
  vitoriasNum: { color: '#0a1628', fontWeight: 'bold', fontSize: 20 },
  vitoriasLabel: { color: '#0a1628', fontSize: 9, fontWeight: 'bold' },
  campeaoLabel: {
    color: '#f5a623', textAlign: 'center', fontWeight: 'bold',
    fontSize: 13, letterSpacing: 2, marginTop: 4, marginBottom: 8,
  },
  podioFrase: {
    color: '#94a3b8', fontStyle: 'italic', textAlign: 'center',
    fontSize: 12, marginTop: 16, marginBottom: 8,
  },
  podioRodape: {
    color: '#f5a623', textAlign: 'center', fontWeight: 'bold',
    fontSize: 13, letterSpacing: 2,
  },
  filaCard: {
    backgroundColor: '#0d1f3c', borderRadius: 10,
    borderWidth: 1, borderColor: '#1e3a5f',
    padding: 12, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center',
  },
  filaPos: { color: '#f5a623', fontWeight: 'bold', fontSize: 18, width: 36 },
  filaInfo: { flex: 1 },
  filaTimeNome: {
    color: '#fff', fontWeight: 'bold', fontSize: 14,
    borderWidth: 1, borderColor: '#f5a623', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
    alignSelf: 'flex-start', marginBottom: 6,
  },
  filaJogadores: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  filaJogadorChip: { color: '#94a3b8', fontSize: 13 },
  filaVitorias: { alignItems: 'center' },
  filaVitoriasNum: {
    color: '#fff', fontWeight: 'bold', fontSize: 14,
    backgroundColor: '#22c55e', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  filaVitoriasLabel: { fontSize: 14 },
  rankingJogadoresCard: {
    borderWidth: 1, borderColor: '#f5a623', borderRadius: 16,
    backgroundColor: '#0d1f3c', marginTop: 16, overflow: 'hidden',
  },
  rankingJogadoresHeader: {
    backgroundColor: '#1a2f4a', padding: 12,
    borderBottomWidth: 1, borderBottomColor: '#f5a623',
  },
  rankingJogadoresTitulo: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  rankingJogadoresColunas: {
    flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#1e3a5f',
  },
  colunaPos: { color: '#f5a623', fontWeight: 'bold', width: 40 },
  colunaNome: { color: '#f5a623', fontWeight: 'bold', flex: 1 },
  colunaVitorias: { color: '#f5a623', fontWeight: 'bold', width: 70, textAlign: 'right' },
  rankingJogadorRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#1e3a5f',
  },
  rankingPos: { fontWeight: 'bold', fontSize: 14, width: 40 },
  rankingNome: { color: '#fff', fontSize: 14, flex: 1 },
  rankingVitoriasBox: {
    backgroundColor: '#22c55e', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  rankingVitoriasNum: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  vazio: { color: '#94a3b8', textAlign: 'center', padding: 20 },
  bottomBtns: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnTimes: {
    flex: 1, borderWidth: 1, borderColor: '#f5a623',
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
  },
  btnTimesText: { color: '#f5a623', fontWeight: 'bold', fontSize: 15 },
});