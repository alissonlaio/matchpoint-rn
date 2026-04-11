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
  const logoSource = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? { uri: '/matchpoint-rn/assets/assets/logo.297edb7f6fe1e047f1aa19e855342bf2.png' }
  : require('../assets/logo.png');

  const handleAdicionarJogador = () => {
    if (!nome.trim()) {
      alertar('Digite o nome do jogador.');
      return;
    }
    if (Platform.OS === 'web') {
      if (confirmar(`Adicionar "${nome.trim()}" à lista?`)) {
        adicionarJogador(nome.trim());
        setNome('');
      }
    } else {
      Alert.alert('Confirmar', `Adicionar "${nome.trim()}" à lista?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Adicionar', onPress: () => { adicionarJogador(nome.trim()); setNome(''); } },
      ]);
    }
  };

  const handleIniciarPelada = () => {
    const qtd = parseInt(qtdJogadores);
    if (isNaN(qtd) || qtd < 2 || qtd > 6) {
      alertar('Digite um número entre 2 e 6.');
      return;
    }
    if (jogadores.length < qtd * 2) {
      alertar(`Você precisa de pelo menos ${qtd * 2} jogadores para montar 2 times.`);
      return;
    }
    iniciarPelada(qtd);
    setModalVisible(false);
    setQtdJogadores('');
    navegar('pelada');
  };

  const handleEditarTime = () => {
    const qtd = parseInt(qtdEditar);
    if (isNaN(qtd) || qtd < 2 || qtd > 6) {
      alertar('Digite um número entre 2 e 6.');
      return;
    }
    if (jogadores.length < qtd * 2) {
      alertar(`Você precisa de pelo menos ${qtd * 2} jogadores para montar 2 times.`);
      return;
    }
    if (confirmar(`Remontar todos os times com ${qtd} jogadores por time?`)) {
      remontarTimes(qtd);
      setModalEditarTimeVisible(false);
      setQtdEditar('');
      navegar('pelada');
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
        <Image
          source={logoSource}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.label}>Nome do Jogador</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o nome..."
        placeholderTextColor="#4a6080"
        value={nome}
        onChangeText={setNome}
        onSubmitEditing={handleAdicionarJogador}
      />

      <TouchableOpacity style={styles.btnAdicionar} onPress={handleAdicionarJogador}>
        <Text style={styles.btnAdicionarText}>✓  Adicionar Jogador</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnLista} onPress={() => navegar('lista')}>
        <Text style={styles.btnListaText}>☰  Lista ({jogadores.length})</Text>
      </TouchableOpacity>

      {peladaIniciada && (
        <TouchableOpacity
          style={styles.btnEditarTime}
          onPress={() => setModalEditarTimeVisible(true)}
        >
          <Text style={styles.btnEditarTimeText}>✏️  Editar Nº de Jogadores por Time</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.btnPelada}
        onPress={() => peladaIniciada ? navegar('pelada') : setModalVisible(true)}
      >
        <Text style={styles.btnPeladaText}>
          {peladaIniciada ? '▶  Continuar Pelada' : '⚽  Iniciar Pelada'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnCampeonato}
        onPress={() => navegar('campeonato')}
      >
        <Text style={styles.btnCampeonatoText}>🏆  Modo Campeonato</Text>
      </TouchableOpacity>

      {/* Modal iniciar pelada */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Nº Jogadores por Time</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: 4"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={qtdJogadores}
              onChangeText={setQtdJogadores}
            />
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

      {/* Modal editar número de jogadores por time */}
      <Modal visible={modalEditarTimeVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Editar Nº de Jogadores por Time</Text>
            <Text style={styles.modalAviso}>
              ⚠️ Os times serão remontados. As vitórias dos jogadores serão mantidas.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ex: 4"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={qtdEditar}
              onChangeText={setQtdEditar}
            />
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
  container: { flex: 1, backgroundColor: '#0a1628' },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#0d1f3c',
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  rankingBtn: {
    backgroundColor: '#f5a623', width: 44, height: 44,
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  rankingBtnText: { fontSize: 20 },
  logoContainer: { alignItems: 'center', marginVertical: 24 },
  logo: { width: 220, height: 220 },
  label: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginHorizontal: 16, marginBottom: 8 },
  input: {
    backgroundColor: '#0d1f3c', borderRadius: 10, borderWidth: 1,
    borderColor: '#1e3a5f', color: '#fff', fontSize: 15,
    paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 16, marginBottom: 16,
  },
  btnAdicionar: {
    backgroundColor: '#22c55e', borderRadius: 10, marginHorizontal: 16,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  btnAdicionarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnLista: {
    backgroundColor: '#1e2d40', borderRadius: 10, marginHorizontal: 16,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  btnListaText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnEditarTime: {
    borderRadius: 10, marginHorizontal: 16, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#3b82f6', marginBottom: 12,
  },
  btnEditarTimeText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 16 },
  btnPelada: {
    borderRadius: 10, marginHorizontal: 16, paddingVertical: 16,
    alignItems: 'center', borderWidth: 2, borderColor: '#f5a623', marginBottom: 12,
  },
  btnPeladaText: { color: '#f5a623', fontWeight: 'bold', fontSize: 16 },
  btnCampeonato: {
    borderRadius: 10, marginHorizontal: 16, paddingVertical: 16,
    alignItems: 'center', borderWidth: 2, borderColor: '#a855f7',
  },
  btnCampeonatoText: { color: '#a855f7', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#111' },
  modalAviso: {
    fontSize: 13, color: '#ef4444', marginBottom: 12,
    backgroundColor: '#fff5f5', padding: 8, borderRadius: 6,
  },
  modalInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, fontSize: 15, color: '#111', marginBottom: 16,
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalBtnSalvar: {
    flex: 1, backgroundColor: '#3b82f6', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center',
  },
  modalBtnSalvarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalBtnCancelar: {
    flex: 1, backgroundColor: '#ef4444', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center',
  },
  modalBtnCancelarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});