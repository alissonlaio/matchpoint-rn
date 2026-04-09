import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Platform,
} from 'react-native';
import { useStore } from '../store/useStore';
import { Screen } from '../App';
import { Time } from '../types';

interface Props {
  navegar: (s: Screen) => void;
}

export default function PeladaScreen({ navegar }: Props) {
  const {
    timeEmQuadra1, timeEmQuadra2, fila,
    registrarVitoria, encerrarPelada,
  } = useStore();

  const handleVitoria = (time: Time) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`O ${getTimeNome(time)} venceu a partida?`)) {
        registrarVitoria(time.id);
      }
    } else {
      Alert.alert(
        'Confirmar Vitória',
        `O ${getTimeNome(time)} venceu a partida?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => registrarVitoria(time.id) },
        ]
      );
    }
  };

  const handleEncerrar = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Tem certeza? Isso vai apagar tudo — jogadores, times, ranking e vitórias do dia.')) {
        encerrarPelada();
        navegar('home');
      }
    } else {
      Alert.alert(
        'Encerrar Pelada',
        'Tem certeza? Isso vai apagar tudo — jogadores, times, ranking e vitórias do dia.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Encerrar', style: 'destructive',
            onPress: () => {
              encerrarPelada();
              navegar('home');
            }
          },
        ]
      );
    }
  };

  const getTimeNome = (time: Time) => `Time ${time.numero}`;

  const renderTime = (time: Time, label: string) => (
    <View style={[styles.timeCard, time.congelado && styles.timeCongelado]}>
      <View style={styles.timeCardHeader}>
        <Text style={styles.timeCardNome}>
          {time.congelado ? '❄️ ' : ''}{getTimeNome(time)}
        </Text>
        <View style={styles.vitoriasBox}>
          <Text style={styles.vitoriasNum}>{time.vitoriasSeguidas}</Text>
          <Text style={styles.vitoriasLabel}>VITÓRIAS</Text>
        </View>
      </View>
      <View style={styles.jogadoresGrid}>
        {time.jogadores.map((j) => (
          <View key={j.id} style={styles.jogadorChip}>
            <Text style={styles.jogadorChipText}>{j.nome}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.btnVitoria} onPress={() => handleVitoria(time)}>
        <Text style={styles.btnVitoriaText}>🏆 {label} Venceu!</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnHome} onPress={() => navegar('home')}>
          <Text style={styles.btnHomeText}>➕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MatchPoint V.P</Text>
        <TouchableOpacity style={styles.rankingBtn} onPress={() => navegar('ranking')}>
          <Text style={styles.rankingBtnText}>📊</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.sectionTitle}>⚡ Em Quadra</Text>

        {timeEmQuadra1 && renderTime(timeEmQuadra1, 'Time A')}

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {timeEmQuadra2 && renderTime(timeEmQuadra2, 'Time B')}

        {fila.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📋 Fila de Espera</Text>
            {fila.map((time, idx) => (
              <View key={time.id} style={[
                styles.filaCard,
                time.congelado && styles.filaCardCongelado,
              ]}>
                <View style={styles.filaCardLeft}>
                  {time.congelado ? (
                    <Text style={styles.filaIconeCongelado}>❄️</Text>
                  ) : (
                    <Text style={styles.filaPosicao}>{idx + 3}º</Text>
                  )}
                  <View>
                    <Text style={[
                      styles.filaTimeNome,
                      time.congelado && styles.filaTimeNomeCongelado,
                    ]}>
                      {time.congelado ? '🏆 AGUARDANDO' : `Time ${time.numero}`}
                    </Text>
                    {time.congelado && (
                      <Text style={styles.filaCongeladoSubtitle}>
                        Time {time.numero} — {time.vitorias} vitórias
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.filaJogadores}>
                  {time.jogadores.map((j) => (
                    <Text key={j.id} style={[
                      styles.filaJogadorNome,
                      time.congelado && styles.filaJogadorNomeCongelado,
                    ]}>{j.nome}</Text>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.btnEncerrar} onPress={handleEncerrar}>
          <Text style={styles.btnEncerrarText}>🔴 Encerrar Pelada</Text>
        </TouchableOpacity>

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
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  btnHome: {
    backgroundColor: '#22c55e', width: 44, height: 44,
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  btnHomeText: { fontSize: 20 },
  rankingBtn: {
    backgroundColor: '#f5a623', width: 44, height: 44,
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  rankingBtnText: { fontSize: 20 },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    color: '#f5a623', fontWeight: 'bold', fontSize: 16,
    marginTop: 16, marginBottom: 10,
  },
  timeCard: {
    backgroundColor: '#0d1f3c', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e3a5f',
    padding: 14, marginBottom: 8,
  },
  timeCongelado: {
    borderColor: '#60a5fa', borderWidth: 2,
  },
  timeCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  timeCardNome: { color: '#f5a623', fontWeight: 'bold', fontSize: 17 },
  vitoriasBox: {
    backgroundColor: '#f5a623', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 4, alignItems: 'center',
  },
  vitoriasNum: { color: '#0a1628', fontWeight: 'bold', fontSize: 18 },
  vitoriasLabel: { color: '#0a1628', fontSize: 9, fontWeight: 'bold' },
  jogadoresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  jogadorChip: {
    backgroundColor: '#1e3a5f', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  jogadorChipText: { color: '#fff', fontSize: 13 },
  btnVitoria: {
    backgroundColor: '#22c55e', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
  },
  btnVitoriaText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  vsContainer: { alignItems: 'center', marginVertical: 8 },
  vsText: { color: '#f5a623', fontWeight: 'bold', fontSize: 24 },
  filaCard: {
    backgroundColor: '#0d1f3c', borderRadius: 10,
    borderWidth: 1, borderColor: '#1e3a5f',
    padding: 12, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center',
  },
  filaCardCongelado: {
    borderColor: '#60a5fa', borderWidth: 2,
    backgroundColor: '#0f2a4a',
  },
  filaCardLeft: { marginRight: 12, alignItems: 'center' },
  filaPosicao: { color: '#f5a623', fontWeight: 'bold', fontSize: 16 },
  filaTimeNome: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  filaTimeNomeCongelado: { color: '#60a5fa' },
  filaIconeCongelado: { fontSize: 24, marginRight: 4 },
  filaCongeladoSubtitle: {
    color: '#60a5fa', fontSize: 11, marginTop: 2,
  },
  filaJogadores: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  filaJogadorNome: {
    color: '#94a3b8', fontSize: 13,
    backgroundColor: '#1e3a5f', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  filaJogadorNomeCongelado: {
    backgroundColor: '#1e3a5f', color: '#60a5fa',
  },
  btnEncerrar: {
    backgroundColor: 'transparent', borderWidth: 2,
    borderColor: '#ef4444', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 24,
  },
  btnEncerrarText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
});