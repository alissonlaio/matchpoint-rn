import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, ScrollView, Modal, Platform, Alert,
} from 'react-native';
import { useStore } from '../store/useStore';
import { Screen } from '../App';

interface Props {
  navegar: (s: Screen) => void;
}

function confirmar(mensagem: string): boolean {
  if (Platform.OS === 'web') return window.confirm(mensagem);
  return true;
}

function alertar(mensagem: string) {
  if (Platform.OS === 'web') window.alert(mensagem);
}

export default function HomeScreen({ navegar }: Props) {
  const [nome, setNome] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalEditarTimeVisible, setModalEditarTimeVisible] = useState(false);
  const [qtdJogadores, setQtdJogadores] = useState('');
  const [qtdEditar, setQtdEditar] = useState('');
  const { jogadores, adicionarJogador, peladaIniciada, iniciarPelada, remontarTimes } = useStore();

  const logoSource = Platform.OS === 'web'
    ? { uri: 'https://alissonlaio.github.io/matchpoint-rn/assets/assets/logo.64dbe0f48b90f5dc0d6fa048b1d0da9b.png' }
    : require('../assets/logo.png');

  const handleAdicionarJogador = () => {
    if (!nome.trim()) { alertar('Digite o nome do jogador.'); return; }
    if (Platform.OS === 'web') {
      if (confirmar(`Adicionar "${nome.trim()}" à lista?`)) { adicionarJogador(nome.trim()); setNome(''); }
    } else {
      Alert.alert('Confirmar', `Adicionar "${nome.trim()}" à lista?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Adicionar', onPress: () => { adicionarJogador(nome.trim()); setNome(''); } },
      ]);
    }
  };

  const handleIniciarPelada = () => {
    const qtd = parseInt(qtdJogadores);
    if (isNaN(qtd) || qtd < 2 || qtd > 6) { alertar('Digite um número entre 2 e 6.'); return; }
    if (jogadores.length < qtd * 2) { alertar(`Você precisa de pelo menos ${qtd * 2} jogadores para montar 2 times.`); return; }
    iniciarPelada(qtd); setModalVisible(false); setQtdJogadores(''); navegar('pelada');
  };

  const handleEditarTime = () => {
    const qtd = parseInt(qtdEditar);
    if (isNaN(qtd) || qtd < 2 || qtd > 6) { alertar('Digite um número entre 2 e 6.'); return; }
    if (jogadores.length < qtd * 2) { alertar(`Você precisa de pelo menos ${qtd * 2} jogadores para montar 2 times.`); return; }
    if (confirmar(`Remontar todos os times com ${qtd} jogadores por time?`)) {
      remontarTimes(qtd); setModalEditarTimeVisible(false); setQtdEditar(''); navegar('pelada');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MatchPoint V.P</Text>
        <TouchableOpacity style={styles.rankingBtn} onPress={() => navegar('ranking')}>
          <Text style={styles.rankingBtnText}>📊</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={styles.label}>Nome do Jogador</Text>
      <TextInput
        style={styles.input} placeholder="Digite o nome..."
        placeholderTextColor="#3a5070" value={nome}
        onChangeText={setNome} onSubmitEditing={handleAdicionarJogador}
      />

      <TouchableOpacity style={styles.btnAdicionar} onPress={handleAdicionarJogador}>
        <Text style={styles.btnAdicionarText}>✓  Adicionar Jogador</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnLista} onPress={() => navegar('lista')}>
        <Text style={styles.btnListaText}>☰  Lista ({jogadores.length})</Text>
      </TouchableOpacity>

      {peladaIniciada && (
        <TouchableOpacity style={styles.btnEditarTime} onPress={() => setModalEditarTimeVisible(true)}>
          <Text style={styles.btnEditarTimeText}>✏️  Editar Nº de Jogadores por Time</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.btnPelada} onPress={() => peladaIniciada ? navegar('pelada') : setModalVisible(true)}>
        <Text style={styles.btnPeladaText}>{peladaIniciada ? '▶  Continuar Pelada' : '⚽  Iniciar Pelada'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnCampeonato} onPress={() => navegar('campeonato')}>
        <Text style={styles.btnCampeonatoText}>🏆  Modo Campeonato</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nº Jogadores por Time</Text>
            <TextInput style={styles.modalInput} placeholder="Ex: 4" placeholderTextColor="#3a5070"
              keyboardType="numeric" value={qtdJogadores} onChangeText={setQtdJogadores} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={handleIniciarPelada}>
                <Text style={styles.modalBtnSalvarText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={modalEditarTimeVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Editar Nº de Jogadores por Time</Text>
            <Text style={styles.modalAviso}>⚠️ Os times serão remontados. As vitórias dos jogadores serão mantidas.</Text>
            <TextInput style={styles.modalInput} placeholder="Ex: 4" placeholderTextColor="#3a5070"
              keyboardType="numeric" value={qtdEditar} onChangeText={setQtdEditar} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={handleEditarTime}>
                <Text style={styles.modalBtnSalvarText}>Remontar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalEditarTimeVisible(false)}>
                <Text style={styles.modalBtnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050d1a' },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#071020',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
    borderBottomWidth: 2, borderBottomColor: '#f5c000',
  },
  headerTitle: { color: '#f5c000', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  rankingBtn: {
    backgroundColor: '#f5c000', width: 44, height: 44,
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  rankingBtnText: { fontSize: 20 },
  logoContainer: { alignItems: 'center', marginVertical: 24 },
  logo: { width: 220, height: 220 },
  label: { color: '#f5c000', fontWeight: 'bold', fontSize: 15, marginHorizontal: 16, marginBottom: 8 },
  input: {
    backgroundColor: '#0c1a35', borderRadius: 10, borderWidth: 1,
    borderColor: '#1a3a6e', color: '#fff', fontSize: 15,
    paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 16, marginBottom: 16,
  },
  btnAdicionar: {
    backgroundColor: '#00c853', borderRadius: 10, marginHorizontal: 16,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  btnAdicionarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnLista: {
    backgroundColor: '#0c1a35', borderRadius: 10, marginHorizontal: 16,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
    borderWidth: 1, borderColor: '#1a3a6e',
  },
  btnListaText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnEditarTime: {
    borderRadius: 10, marginHorizontal: 16, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#0066ff', marginBottom: 12,
  },
  btnEditarTimeText: { color: '#0066ff', fontWeight: 'bold', fontSize: 16 },
  btnPelada: {
    borderRadius: 10, marginHorizontal: 16, paddingVertical: 16,
    alignItems: 'center', borderWidth: 2, borderColor: '#f5c000', marginBottom: 12,
    backgroundColor: 'rgba(245,192,0,0.08)',
  },
  btnPeladaText: { color: '#f5c000', fontWeight: 'bold', fontSize: 16 },
  btnCampeonato: {
    borderRadius: 10, marginHorizontal: 16, paddingVertical: 16,
    alignItems: 'center', borderWidth: 2, borderColor: '#a855f7',
    backgroundColor: 'rgba(168,85,247,0.08)',
  },
  btnCampeonatoText: { color: '#a855f7', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#0c1a35', borderRadius: 16, padding: 24, width: '80%', borderWidth: 1, borderColor: '#f5c000' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#f5c000' },
  modalAviso: { fontSize: 13, color: '#ef4444', marginBottom: 12, backgroundColor: 'rgba(239,68,68,0.1)', padding: 8, borderRadius: 6 },
  modalInput: { borderWidth: 1, borderColor: '#1a3a6e', borderRadius: 8, padding: 12, fontSize: 15, color: '#fff', marginBottom: 16, backgroundColor: '#050d1a' },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalBtnSalvar: { flex: 1, backgroundColor: '#0066ff', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  modalBtnSalvarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalBtnCancelar: { flex: 1, backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  modalBtnCancelarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});