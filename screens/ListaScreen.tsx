import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Modal, Platform,
} from 'react-native';
import { useStore } from '../store/useStore';
import { Screen } from '../App';
import { Jogador, Time } from '../types';

interface Props {
  navegar: (s: Screen) => void;
}

export default function ListaScreen({ navegar }: Props) {
  const {
    jogadores, editarJogador, removerJogador,
    peladaIniciada, fila, timeEmQuadra1, timeEmQuadra2,
    substituirJogador, moverJogadorParaFila,
    moverJogadorParaFilaComSubstituto,
  } = useStore();

  const [modalEditVisible, setModalEditVisible] = useState(false);
  const [modalSubstVisible, setModalSubstVisible] = useState(false);
  const [jogadorSelecionado, setJogadorSelecionado] = useState<Jogador | null>(null);
  const [timeDoJogador, setTimeDoJogador] = useState<Time | null>(null);
  const [novoNome, setNovoNome] = useState('');

  const confirmar = (msg: string) => { if (Platform.OS === 'web') return window.confirm(msg); return true; };

  const encontrarTimeDoJogador = (jogadorId: string): Time | null => {
    if (timeEmQuadra1?.jogadores.find(j => j.id === jogadorId)) return timeEmQuadra1;
    if (timeEmQuadra2?.jogadores.find(j => j.id === jogadorId)) return timeEmQuadra2;
    for (const time of fila) { if (time.jogadores.find(j => j.id === jogadorId)) return time; }
    return null;
  };

  const filaSemCongelado = fila.filter(t => !t.congelado);
  const terceiroTime = filaSemCongelado[0];
  const temTerceiroTime = terceiroTime && terceiroTime.jogadores.length > 0;

  const handleEditar = (jogador: Jogador) => {
    if (confirmar(`Deseja editar "${jogador.nome}"?`)) { setJogadorSelecionado(jogador); setNovoNome(jogador.nome); setModalEditVisible(true); }
  };

  const handleSalvarEdicao = () => {
    if (!novoNome.trim()) { if (Platform.OS === 'web') window.alert('Digite um nome válido.'); return; }
    if (confirmar(`Salvar nome como "${novoNome.trim()}"?`)) { editarJogador(jogadorSelecionado!.id, novoNome.trim()); setModalEditVisible(false); }
  };

  const handleRemover = (jogador: Jogador) => {
    if (confirmar(`Remover "${jogador.nome}" da lista?`)) { removerJogador(jogador.id); }
  };

  const handleAbrirSubst = (jogador: Jogador, time: Time | null) => { setJogadorSelecionado(jogador); setTimeDoJogador(time); setModalSubstVisible(true); };

  const handleSubstituir = (jogadorEntra: Jogador) => {
    if (!jogadorSelecionado) return;
    if (confirmar(`Trocar "${jogadorSelecionado.nome}" por "${jogadorEntra.nome}"?`)) {
      const timeSai = timeDoJogador;
      const timeEntra = encontrarTimeDoJogador(jogadorEntra.id);
      if (timeSai && timeEntra) { substituirJogador(timeSai.id, jogadorSelecionado.id, jogadorEntra.id); substituirJogador(timeEntra.id, jogadorEntra.id, jogadorSelecionado.id); }
      else if (timeSai) { substituirJogador(timeSai.id, jogadorSelecionado.id, jogadorEntra.id); }
      setModalSubstVisible(false);
    }
  };

  const handleMoverParaFila = () => {
    if (!jogadorSelecionado || !timeDoJogador) return;
    const substitutoNome = terceiroTime?.jogadores[0]?.nome;
    if (confirmar(`"${jogadorSelecionado.nome}" vai pro final da fila e "${substitutoNome}" entra no time. Confirmar?`)) {
      moverJogadorParaFilaComSubstituto(timeDoJogador.id, jogadorSelecionado.id); setModalSubstVisible(false);
    }
  };

  const todosOsTimes: { time: Time; label: string }[] = [];
  if (peladaIniciada) {
    if (timeEmQuadra1) todosOsTimes.push({ time: timeEmQuadra1, label: '⚡ Em Quadra — Time A' });
    if (timeEmQuadra2) todosOsTimes.push({ time: timeEmQuadra2, label: '⚡ Em Quadra — Time B' });
    fila.forEach((t, idx) => { todosOsTimes.push({ time: t, label: t.congelado ? '❄️ Aguardando' : `📋 Fila — ${idx + 3}º` }); });
  }

  const getBadgeStatus = (time: Time | null): { texto: string; cor: string } | null => {
    if (!time) return null;
    const eEmQuadra = time.id === timeEmQuadra1?.id || time.id === timeEmQuadra2?.id;
    if (eEmQuadra) return { texto: 'em quadra', cor: '#00c853' };
    if (time.congelado) return { texto: '❄️ aguardando', cor: '#0066ff' };
    return null;
  };

  const renderJogadorRow = (j: Jogador, time: Time | null, podeRemover: boolean) => {
    const badge = getBadgeStatus(time);
    return (
      <View key={j.id} style={styles.jogadorRow}>
        <View style={styles.jogadorInfo}>
          <Text style={styles.jogadorNome}>{j.nome}</Text>
          {badge && (<Text style={[styles.jogadorBadge, { color: badge.cor, borderColor: badge.cor }]}>{badge.texto}</Text>)}
        </View>
        <View style={styles.jogadorBtns}>
          <TouchableOpacity style={styles.btnEditar} onPress={() => handleEditar(j)}>
            <Text style={styles.btnIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSubst} onPress={() => handleAbrirSubst(j, time)}>
            <Text style={styles.btnIcon}>🔄</Text>
          </TouchableOpacity>
          {podeRemover ? (
            <TouchableOpacity style={styles.btnRemover} onPress={() => handleRemover(j)}>
              <Text style={styles.btnRemoverText}>✕</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.btnRemoverDesabilitado}>
              <Text style={styles.btnRemoverDesabilitadoText}>✕</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnPelada} onPress={() => navegar('pelada')}>
          <Text style={styles.btnPeladaText}>⚽</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MatchPoint V.P</Text>
        <TouchableOpacity style={styles.rankingBtn} onPress={() => navegar('ranking')}>
          <Text style={styles.rankingBtnText}>📊</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {peladaIniciada ? (
          todosOsTimes.map(({ time, label }) => {
            const eEmQuadra = time.id === timeEmQuadra1?.id || time.id === timeEmQuadra2?.id;
            const podeRemover = !eEmQuadra && !time.congelado;
            return (
              <View key={time.id} style={[styles.timeCard, time.congelado && styles.timeCardCongelado]}>
                <View style={styles.timeHeader}>
                  <Text style={[styles.timeLabel, time.congelado && styles.timeLabelCongelado]}>{label}</Text>
                  <View style={[styles.vitoriasBox, time.congelado && styles.vitoriasBoxCongelado]}>
                    <Text style={styles.vitoriasNum}>{time.vitoriasSeguidas}</Text>
                    <Text style={styles.vitoriasLabel}>VIT</Text>
                  </View>
                </View>
                {time.jogadores.map(j => renderJogadorRow(j, time, podeRemover))}
                <View style={styles.separador} />
              </View>
            );
          })
        ) : (
          <View style={styles.timeCard}>
            <View style={styles.timeHeader}>
              <Text style={styles.timeLabel}>Jogadores ({jogadores.length})</Text>
            </View>
            {jogadores.length === 0 ? (
              <Text style={styles.vazio}>Nenhum jogador adicionado ainda.</Text>
            ) : (
              jogadores.map(j => renderJogadorRow(j, null, true))
            )}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.btnVoltar} onPress={() => navegar('home')}>
        <Text style={styles.btnVoltarText}>← Voltar</Text>
      </TouchableOpacity>

      <Modal visible={modalEditVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Editar Jogador</Text>
            {Platform.OS === 'web' ? (
              <input style={{ width: '100%', padding: 10, fontSize: 15, borderRadius: 8, border: '1px solid #1a3a6e', backgroundColor: '#050d1a', color: '#fff', marginBottom: 16, boxSizing: 'border-box' }}
                value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Novo nome..." />
            ) : (
              <Text style={{ color: '#fff', marginBottom: 16 }}>{novoNome}</Text>
            )}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={handleSalvarEdicao}>
                <Text style={styles.modalBtnSalvarText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalEditVisible(false)}>
                <Text style={styles.modalBtnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalSubstVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Substituir "{jogadorSelecionado?.nome}"</Text>
            <Text style={styles.modalSubtitle}>Escolha quem vai entrar:</Text>
            <ScrollView style={{ maxHeight: 250 }}>
              {jogadores.filter(j => j.id !== jogadorSelecionado?.id).map((j) => {
                const time = encontrarTimeDoJogador(j.id);
                return (
                  <TouchableOpacity key={j.id} style={styles.modalJogadorItem} onPress={() => handleSubstituir(j)}>
                    <Text style={styles.modalJogadorNome}>{j.nome}</Text>
                    {time && (<Text style={styles.modalJogadorTime}>Time {time.numero}</Text>)}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {temTerceiroTime ? (
              <TouchableOpacity style={styles.modalBtnFila} onPress={handleMoverParaFila}>
                <Text style={styles.modalBtnFilaText}>📋 Mandar pra fila → {terceiroTime.jogadores[0].nome} entra</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.modalBtnFilaDesabilitado}>
                <Text style={styles.modalBtnFilaDesabilitadoText}>📋 Sem 3º time disponível para substituir</Text>
              </View>
            )}
            <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalSubstVisible(false)}>
              <Text style={styles.modalBtnCancelarText}>Cancelar</Text>
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
  btnPelada: { backgroundColor: '#f5c000', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  btnPeladaText: { fontSize: 20 },
  rankingBtn: { backgroundColor: '#f5c000', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  rankingBtnText: { fontSize: 20 },
  content: { padding: 16, paddingBottom: 80 },
  timeCard: { backgroundColor: '#0c1a35', borderRadius: 12, marginBottom: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#1a3a6e' },
  timeCardCongelado: { borderWidth: 2, borderColor: '#0066ff', backgroundColor: '#071530' },
  timeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#071020' },
  timeLabel: { fontWeight: 'bold', fontSize: 14, color: '#f5c000', flex: 1 },
  timeLabelCongelado: { color: '#0066ff' },
  vitoriasBox: { backgroundColor: '#f5c000', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignItems: 'center' },
  vitoriasBoxCongelado: { backgroundColor: '#0066ff' },
  vitoriasNum: { color: '#050d1a', fontWeight: 'bold', fontSize: 14 },
  vitoriasLabel: { color: '#050d1a', fontSize: 8, fontWeight: 'bold' },
  jogadorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a3a6e' },
  jogadorInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  jogadorNome: { fontSize: 15, color: '#fff' },
  jogadorBadge: { fontSize: 10, fontWeight: 'bold', borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  jogadorBtns: { flexDirection: 'row', gap: 6 },
  btnEditar: { borderWidth: 1, borderColor: '#f5c000', borderRadius: 6, padding: 6, width: 36, alignItems: 'center' },
  btnSubst: { borderWidth: 1, borderColor: '#0066ff', borderRadius: 6, padding: 6, width: 36, alignItems: 'center' },
  btnRemover: { borderWidth: 1, borderColor: '#ef4444', borderRadius: 6, padding: 6, width: 36, alignItems: 'center' },
  btnRemoverDesabilitado: { borderWidth: 1, borderColor: '#2a3a5e', borderRadius: 6, padding: 6, width: 36, alignItems: 'center', backgroundColor: '#0c1a35' },
  btnIcon: { fontSize: 14 },
  btnRemoverText: { fontSize: 14, color: '#ef4444', fontWeight: 'bold' },
  btnRemoverDesabilitadoText: { fontSize: 14, color: '#2a3a5e', fontWeight: 'bold' },
  separador: { height: 8, backgroundColor: '#050d1a' },
  vazio: { padding: 16, color: '#3a5070', textAlign: 'center' },
  btnVoltar: { position: 'absolute', bottom: 16, left: 16, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#f5c000', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  btnVoltarText: { color: '#f5c000', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#0c1a35', borderRadius: 16, padding: 24, width: '85%', borderWidth: 1, borderColor: '#f5c000' },
  modalTitle: { color: '#f5c000', fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  modalSubtitle: { color: '#3a5070', fontSize: 13, marginBottom: 12 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalBtnSalvar: { flex: 1, backgroundColor: '#0066ff', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  modalBtnSalvarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalBtnCancelar: { backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  modalBtnCancelarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalJogadorItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a3a6e' },
  modalJogadorNome: { color: '#fff', fontSize: 15 },
  modalJogadorTime: { color: '#f5c000', fontSize: 12, borderWidth: 1, borderColor: '#f5c000', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  modalBtnFila: { backgroundColor: '#1a3a6e', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  modalBtnFilaText: { color: '#0066ff', fontWeight: 'bold', fontSize: 14 },
  modalBtnFilaDesabilitado: { backgroundColor: '#071020', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  modalBtnFilaDesabilitadoText: { color: '#2a3a5e', fontSize: 13 },
});