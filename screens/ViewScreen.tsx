import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { ref, onValue } from 'firebase/database';
import { db } from '../store/firebase';
import { Time } from '../types';

export default function ViewScreen() {
  const [timeEmQuadra1, setTimeEmQuadra1] = useState<Time | null>(null);
  const [timeEmQuadra2, setTimeEmQuadra2] = useState<Time | null>(null);
  const [fila, setFila] = useState<Time[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState('');

  useEffect(() => {
    const peladaRef = ref(db, 'pelada');
    const unsubscribe = onValue(peladaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTimeEmQuadra1(data.timeEmQuadra1 || null);
        setTimeEmQuadra2(data.timeEmQuadra2 || null);
        setFila(data.fila || []);
        setUltimaAtualizacao(new Date().toLocaleTimeString('pt-BR'));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f5c000" />
        <Text style={styles.loadingText}>Conectando...</Text>
      </View>
    );
  }

  if (!timeEmQuadra1 && !timeEmQuadra2) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.semPeladaText}>🏐</Text>
        <Text style={styles.semPeladaTitle}>Nenhuma pelada em andamento</Text>
        <Text style={styles.semPeladaSubtitle}>Aguarde o organizador iniciar a pelada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏐 MatchPoint V.P</Text>
        <Text style={styles.headerSub}>Ao vivo • {ultimaAtualizacao}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.sectionTitle}>⚡ Em Quadra</Text>

        {/* Time A */}
        {timeEmQuadra1 && (
          <View style={styles.timeCard}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeNome}>Time {timeEmQuadra1.numero}</Text>
              <View style={styles.vitoriasBox}>
                <Text style={styles.vitoriasNum}>{timeEmQuadra1.vitoriasSeguidas}</Text>
                <Text style={styles.vitoriasLabel}>VITÓRIAS</Text>
              </View>
            </View>
            <View style={styles.jogadoresGrid}>
              {timeEmQuadra1.jogadores?.map((j) => (
                <View key={j.id} style={styles.jogadorChip}>
                  <Text style={styles.jogadorChipText}>{j.nome}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Time B */}
        {timeEmQuadra2 && (
          <View style={styles.timeCard}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeNome}>Time {timeEmQuadra2.numero}</Text>
              <View style={styles.vitoriasBox}>
                <Text style={styles.vitoriasNum}>{timeEmQuadra2.vitoriasSeguidas}</Text>
                <Text style={styles.vitoriasLabel}>VITÓRIAS</Text>
              </View>
            </View>
            <View style={styles.jogadoresGrid}>
              {timeEmQuadra2.jogadores?.map((j) => (
                <View key={j.id} style={styles.jogadorChip}>
                  <Text style={styles.jogadorChipText}>{j.nome}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Fila */}
        {fila.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📋 Próximos Times</Text>
            {fila.map((time, idx) => (
              <View key={time.id} style={[
                styles.filaCard,
                time.congelado && styles.filaCardCongelado,
              ]}>
                <View style={styles.filaLeft}>
                  {time.congelado ? (
                    <Text style={styles.filaIconeCongelado}>❄️</Text>
                  ) : (
                    <Text style={styles.filaPosicao}>{idx + 3}º</Text>
                  )}
                  <View>
                    <Text style={[styles.filaTimeNome, time.congelado && styles.filaTimeNomeCongelado]}>
                      {time.congelado ? '🏆 AGUARDANDO' : `Time ${time.numero}`}
                    </Text>
                    {time.congelado && (
                      <Text style={styles.filaSubtitle}>Time {time.numero} — {time.vitorias} vitórias</Text>
                    )}
                  </View>
                </View>
                <View style={styles.filaJogadores}>
                  {time.jogadores?.map((j) => (
                    <Text key={j.id} style={[
                      styles.filaJogadorNome,
                      time.congelado && styles.filaJogadorCongelado,
                    ]}>{j.nome}</Text>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050d1a' },
  loadingContainer: { flex: 1, backgroundColor: '#050d1a', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#f5c000', marginTop: 12, fontSize: 16 },
  semPeladaText: { fontSize: 64, marginBottom: 16 },
  semPeladaTitle: { color: '#f5c000', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  semPeladaSubtitle: { color: '#3a5070', fontSize: 14 },
  header: {
    backgroundColor: '#071020', paddingHorizontal: 16,
    paddingTop: 48, paddingBottom: 12,
    borderBottomWidth: 2, borderBottomColor: '#f5c000',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { color: '#f5c000', fontSize: 18, fontWeight: 'bold' },
  headerSub: { color: '#00c853', fontSize: 12, fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: '#f5c000', fontWeight: 'bold', fontSize: 16, marginTop: 16, marginBottom: 10, letterSpacing: 1 },
  timeCard: { backgroundColor: '#0c1a35', borderRadius: 12, borderWidth: 1, borderColor: '#1a3a6e', padding: 14, marginBottom: 8 },
  timeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  timeNome: { color: '#f5c000', fontWeight: 'bold', fontSize: 17 },
  vitoriasBox: { backgroundColor: '#f5c000', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, alignItems: 'center' },
  vitoriasNum: { color: '#050d1a', fontWeight: 'bold', fontSize: 18 },
  vitoriasLabel: { color: '#050d1a', fontSize: 9, fontWeight: 'bold' },
  jogadoresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  jogadorChip: { backgroundColor: '#1a3a6e', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  jogadorChipText: { color: '#fff', fontSize: 13 },
  vsContainer: { alignItems: 'center', marginVertical: 8 },
  vsText: { color: '#f5c000', fontWeight: 'bold', fontSize: 28, letterSpacing: 4 },
  filaCard: { backgroundColor: '#0c1a35', borderRadius: 10, borderWidth: 1, borderColor: '#1a3a6e', padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  filaCardCongelado: { borderColor: '#0066ff', borderWidth: 2, backgroundColor: '#071530' },
  filaLeft: { marginRight: 12, alignItems: 'center' },
  filaPosicao: { color: '#f5c000', fontWeight: 'bold', fontSize: 16 },
  filaTimeNome: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  filaTimeNomeCongelado: { color: '#0066ff' },
  filaIconeCongelado: { fontSize: 24 },
  filaSubtitle: { color: '#0066ff', fontSize: 11, marginTop: 2 },
  filaJogadores: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  filaJogadorNome: { color: '#94a3b8', fontSize: 13, backgroundColor: '#1a3a6e', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  filaJogadorCongelado: { color: '#0066ff' },
});