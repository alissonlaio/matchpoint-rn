import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Platform, Modal,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useStore } from '../store/useStore';
import { Screen } from '../App';
import { Time } from '../types';

interface Props {
  navegar: (s: Screen) => void;
}

const URL_PUBLICA = 'https://alissonlaio.github.io/matchpoint-rn/?view=1';

export default function PeladaScreen({ navegar }: Props) {
  const {
    timeEmQuadra1, timeEmQuadra2, fila,
    registrarVitoria, encerrarPelada,
    desfazerUltimaVitoria, historicoSnapshots,
    rankingJogadores, rankingTimes,
  } = useStore();

  const [modalResumoVisible, setModalResumoVisible] = useState(false);
  const [modalQRVisible, setModalQRVisible] = useState(false);
  const totalDesfazer = historicoSnapshots.length;

  const handleVitoria = (time: Time) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`O ${getTimeNome(time)} venceu a partida?`)) registrarVitoria(time.id);
    } else {
      Alert.alert('Confirmar Vitória', `O ${getTimeNome(time)} venceu a partida?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => registrarVitoria(time.id) },
      ]);
    }
  };

  const handleDesfazer = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Desfazer a última vitória registrada?')) desfazerUltimaVitoria();
    } else {
      Alert.alert('Desfazer Vitória', 'Desfazer a última vitória registrada?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Desfazer', style: 'destructive', onPress: () => desfazerUltimaVitoria() },
      ]);
    }
  };

  const handleEncerrar = () => setModalResumoVisible(true);

  const handleConfirmarEncerrar = () => {
    setModalResumoVisible(false);
    encerrarPelada();
    navegar('home');
  };

  const getTimeNome = (time: Time) => `Time ${time.numero}`;

  const totalPartidas = rankingTimes.reduce((acc, t) => acc + t.vitorias, 0);
  const jogadoresOrdenados = [...rankingJogadores].sort((a, b) => b.vitorias - a.vitorias);
  const timesOrdenados = [...rankingTimes].sort((a, b) => b.vitorias - a.vitorias);
  const campeao = timesOrdenados[0];
  const top3Jogadores = jogadoresOrdenados.slice(0, 3);

  const renderTime = (time: Time, label: string) => (
    <View style={[styles.timeCard, time.congelado && styles.timeCongelado]}>
      <View style={styles.timeCardHeader}>
        <Text style={styles.timeCardNome}>{time.congelado ? '❄️ ' : ''}{getTimeNome(time)}</Text>
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
        <View style={styles.headerRight}>
          {/* ✅ Botão QR Code */}
          <TouchableOpacity style={styles.btnQR} onPress={() => setModalQRVisible(true)}>
            <Text style={styles.btnQRText}>📱</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rankingBtn} onPress={() => navegar('ranking')}>
            <Text style={styles.rankingBtnText}>📊</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>⚡ Em Quadra</Text>
        {timeEmQuadra1 && renderTime(timeEmQuadra1, 'Time A')}
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        {timeEmQuadra2 && renderTime(timeEmQuadra2, 'Time B')}

        {totalDesfazer > 0 && (
          <TouchableOpacity style={styles.btnDesfazer} onPress={handleDesfazer}>
            <Text style={styles.btnDesfazerText}>
              ↩️ Desfazer última vitória ({totalDesfazer} disponível{totalDesfazer > 1 ? 'is' : ''})
            </Text>
          </TouchableOpacity>
        )}

        {fila.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📋 Fila de Espera</Text>
            {fila.map((time, idx) => (
              <View key={time.id} style={[styles.filaCard, time.congelado && styles.filaCardCongelado]}>
                <View style={styles.filaCardLeft}>
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
                      <Text style={styles.filaCongeladoSubtitle}>Time {time.numero} — {time.vitorias} vitórias</Text>
                    )}
                  </View>
                </View>
                <View style={styles.filaJogadores}>
                  {time.jogadores.map((j) => (
                    <Text key={j.id} style={[styles.filaJogadorNome, time.congelado && styles.filaJogadorNomeCongelado]}>
                      {j.nome}
                    </Text>
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

      {/* ✅ Modal QR Code */}
      <Modal visible={modalQRVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>📱 Acompanhe ao Vivo!</Text>
            <Text style={styles.modalSubtitulo}>
              Escaneie o QR Code ou compartilhe o link com os jogadores
            </Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={URL_PUBLICA}
                size={200}
                color="#050d1a"
                backgroundColor="#fff"
              />
            </View>
            <View style={styles.urlBox}>
              <Text style={styles.urlText}>{URL_PUBLICA}</Text>
            </View>
            <Text style={styles.qrDica}>
              📲 Os jogadores abrem no celular e veem em tempo real quem está em quadra!
            </Text>
            <TouchableOpacity
              style={styles.modalBtnFechar}
              onPress={() => setModalQRVisible(false)}
            >
              <Text style={styles.modalBtnFecharText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal resumo */}
      <Modal visible={modalResumoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>📊 Resumo da Pelada</Text>
            <Text style={styles.modalSubtitulo}>Total de partidas: {totalPartidas}</Text>
            {campeao && (
              <View style={styles.resumoCampeao}>
                <Text style={styles.resumoCampeaoTitulo}>🏆 Time Campeão</Text>
                <Text style={styles.resumoCampeaoNome}>
                  Time {campeao.numero} — {campeao.vitorias} vitória{campeao.vitorias !== 1 ? 's' : ''}
                </Text>
                <View style={styles.resumoJogadoresRow}>
                  {campeao.jogadores.map(j => (<Text key={j.id} style={styles.resumoChip}>{j.nome}</Text>))}
                </View>
              </View>
            )}
            {top3Jogadores.length > 0 && (
              <View style={styles.resumoTop3}>
                <Text style={styles.resumoTop3Titulo}>⭐ Top Jogadores</Text>
                {top3Jogadores.map((j, idx) => (
                  <View key={j.id} style={styles.resumoJogadorRow}>
                    <Text style={styles.resumoJogadorPos}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</Text>
                    <Text style={styles.resumoJogadorNome}>{j.nome}</Text>
                    <Text style={styles.resumoJogadorVit}>{j.vitorias} vit.</Text>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity style={styles.modalBtnEncerrar} onPress={handleConfirmarEncerrar}>
              <Text style={styles.modalBtnEncerrarText}>🔴 Confirmar Encerramento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalResumoVisible(false)}>
              <Text style={styles.modalBtnCancelarText}>Continuar Pelada</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerTitle: { color: '#f5c000', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', gap: 8 },
  btnHome: { backgroundColor: '#00c853', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  btnHomeText: { fontSize: 20 },
  btnQR: { backgroundColor: '#0066ff', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  btnQRText: { fontSize: 20 },
  rankingBtn: { backgroundColor: '#f5c000', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  rankingBtnText: { fontSize: 20 },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: '#f5c000', fontWeight: 'bold', fontSize: 16, marginTop: 16, marginBottom: 10, letterSpacing: 1 },
  timeCard: { backgroundColor: '#0c1a35', borderRadius: 12, borderWidth: 1, borderColor: '#1a3a6e', padding: 14, marginBottom: 8 },
  timeCongelado: { borderColor: '#0066ff', borderWidth: 2 },
  timeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  timeCardNome: { color: '#f5c000', fontWeight: 'bold', fontSize: 17 },
  vitoriasBox: { backgroundColor: '#f5c000', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, alignItems: 'center' },
  vitoriasNum: { color: '#050d1a', fontWeight: 'bold', fontSize: 18 },
  vitoriasLabel: { color: '#050d1a', fontSize: 9, fontWeight: 'bold' },
  jogadoresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  jogadorChip: { backgroundColor: '#1a3a6e', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  jogadorChipText: { color: '#fff', fontSize: 13 },
  btnVitoria: { backgroundColor: '#00c853', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  btnVitoriaText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  vsContainer: { alignItems: 'center', marginVertical: 8 },
  vsText: { color: '#f5c000', fontWeight: 'bold', fontSize: 28, letterSpacing: 4 },
  btnDesfazer: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#f5c000', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  btnDesfazerText: { color: '#f5c000', fontWeight: 'bold', fontSize: 15 },
  filaCard: { backgroundColor: '#0c1a35', borderRadius: 10, borderWidth: 1, borderColor: '#1a3a6e', padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  filaCardCongelado: { borderColor: '#0066ff', borderWidth: 2, backgroundColor: '#071530' },
  filaCardLeft: { marginRight: 12, alignItems: 'center' },
  filaPosicao: { color: '#f5c000', fontWeight: 'bold', fontSize: 16 },
  filaTimeNome: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  filaTimeNomeCongelado: { color: '#0066ff' },
  filaIconeCongelado: { fontSize: 24, marginRight: 4 },
  filaCongeladoSubtitle: { color: '#0066ff', fontSize: 11, marginTop: 2 },
  filaJogadores: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  filaJogadorNome: { color: '#94a3b8', fontSize: 13, backgroundColor: '#1a3a6e', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  filaJogadorNomeCongelado: { backgroundColor: '#1a3a6e', color: '#0066ff' },
  btnEncerrar: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#ef4444', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  btnEncerrarText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#0c1a35', borderRadius: 16, padding: 24, width: '90%', borderWidth: 1, borderColor: '#f5c000' },
  modalTitulo: { color: '#f5c000', fontWeight: 'bold', fontSize: 18, textAlign: 'center', marginBottom: 4 },
  modalSubtitulo: { color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  // ✅ QR Code styles
  qrContainer: { alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 },
  urlBox: { backgroundColor: '#071020', borderRadius: 8, padding: 10, marginBottom: 12 },
  urlText: { color: '#0066ff', fontSize: 11, textAlign: 'center' },
  qrDica: { color: '#94a3b8', fontSize: 12, textAlign: 'center', marginBottom: 16, fontStyle: 'italic' },
  modalBtnFechar: { backgroundColor: '#1a3a6e', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  modalBtnFecharText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  // resumo styles
  resumoCampeao: { backgroundColor: '#1a3a6e', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f5c000' },
  resumoCampeaoTitulo: { color: '#f5c000', fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  resumoCampeaoNome: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 8 },
  resumoJogadoresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  resumoChip: { backgroundColor: '#050d1a', color: '#94a3b8', fontSize: 12, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  resumoTop3: { backgroundColor: '#1a3a6e', borderRadius: 10, padding: 12, marginBottom: 16 },
  resumoTop3Titulo: { color: '#f5c000', fontWeight: 'bold', fontSize: 13, marginBottom: 8 },
  resumoJogadorRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#0c1a35' },
  resumoJogadorPos: { fontSize: 18, width: 32 },
  resumoJogadorNome: { color: '#fff', fontSize: 14, flex: 1 },
  resumoJogadorVit: { color: '#00c853', fontWeight: 'bold', fontSize: 13 },
  modalBtnEncerrar: { backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  modalBtnEncerrarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalBtnCancelar: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#3a5070', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  modalBtnCancelarText: { color: '#3a5070', fontWeight: 'bold', fontSize: 15 },
});