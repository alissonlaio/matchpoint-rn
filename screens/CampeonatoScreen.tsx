import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert, Platform, Modal,
} from 'react-native';
import { useCampeonatoStore, calcularClassificacaoFn } from '../store/campeonatoStore';
import { useStore } from '../store/useStore';
import { Confronto, TimeCampeonato } from '../types';
import { Screen } from '../App';

interface Props {
  navegar: (s: Screen) => void;
}

type Aba = 'times' | 'chaveamento' | 'ranking';

function gerarId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export default function CampeonatoScreen({ navegar }: Props) {
  const { jogadores } = useStore();
  const { campeonato, criarCampeonato, registrarResultado, encerrarCampeonato } = useCampeonatoStore();

  const [aba, setAba] = useState<Aba>('chaveamento');
  const [nomeCamp, setNomeCamp] = useState('');
  const [times, setTimes] = useState<TimeCampeonato[]>([]);
  const [nomeTime, setNomeTime] = useState('');
  const [jogadoresSelecionados, setJogadoresSelecionados] = useState<string[]>([]);
  const [criandoCampeonato, setCriandoCampeonato] = useState(!campeonato);

  // Modal de placar
  const [modalPlacar, setModalPlacar] = useState(false);
  const [confrontoSelecionado, setConfrontoSelecionado] = useState<Confronto | null>(null);
  const [placarA, setPlacarA] = useState('');
  const [placarB, setPlacarB] = useState('');

  const jogadoresJaEmTime = times.flatMap((t) => t.jogadores.map((j) => j.id));

  const toggleJogador = (id: string) => {
    setJogadoresSelecionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const adicionarTime = () => {
    if (!nomeTime.trim()) { alert('Informe o nome do time.'); return; }
    if (jogadoresSelecionados.length === 0) { alert('Selecione ao menos um jogador.'); return; }
    const jogadoresDoTime = jogadores.filter((j) => jogadoresSelecionados.includes(j.id));
    setTimes((prev) => [...prev, { id: gerarId(), nome: nomeTime.trim(), jogadores: jogadoresDoTime }]);
    setNomeTime('');
    setJogadoresSelecionados([]);
  };

  const iniciarCampeonato = () => {
    if (!nomeCamp.trim()) { alert('Informe o nome do campeonato.'); return; }
    if (times.length < 2) { alert('Adicione ao menos 2 times.'); return; }
    criarCampeonato(nomeCamp.trim(), times);
    setCriandoCampeonato(false);
    setAba('chaveamento');
  };

  const abrirModalPlacar = (confronto: Confronto) => {
    setConfrontoSelecionado(confronto);
    setPlacarA('');
    setPlacarB('');
    setModalPlacar(true);
  };

  const confirmarPlacar = () => {
    const pA = parseInt(placarA);
    const pB = parseInt(placarB);
    if (isNaN(pA) || isNaN(pB) || pA < 0 || pB < 0) {
      alert('Digite placares válidos.');
      return;
    }
    if (pA === pB) {
      alert('Não pode haver empate. Digite um placar com vencedor.');
      return;
    }
    if (!confrontoSelecionado) return;
    registrarResultado(confrontoSelecionado.id, pA, pB);
    setModalPlacar(false);
  };

  const handleEncerrar = () => {
    const confirmar = () => {
      encerrarCampeonato();
      setCriandoCampeonato(true);
      setTimes([]);
      setNomeCamp('');
    };
    if (Platform.OS === 'web') {
      if (window.confirm('Encerrar campeonato? Todos os dados serão apagados.')) confirmar();
    } else {
      Alert.alert('Encerrar Campeonato', 'Todos os dados serão apagados.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Encerrar', style: 'destructive', onPress: confirmar },
      ]);
    }
  };

  const getFaseLabel = (fase: string) => {
    if (fase === 'semi') return 'Semifinal';
    if (fase === 'terceiro') return 'Disputa de 3º Lugar';
    if (fase === 'final') return 'Final';
    return 'Fase de Grupos';
  };

  // ── Tela de criação ──
  if (criandoCampeonato || !campeonato) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => navegar('home')}>
            <Text style={styles.btnVoltarText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🏆 Novo Campeonato</Text>
          <View style={{ width: 44 }} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Nome do Campeonato</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Copa de Verão"
            placeholderTextColor="#4a6080"
            value={nomeCamp}
            onChangeText={setNomeCamp}
          />

          <Text style={styles.sectionTitle}>➕ Adicionar Time</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do time"
            placeholderTextColor="#4a6080"
            value={nomeTime}
            onChangeText={setNomeTime}
          />

          <Text style={styles.label}>Selecionar Jogadores</Text>
          <View style={styles.jogadoresGrid}>
            {jogadores
              .filter((j) => !jogadoresJaEmTime.includes(j.id) || jogadoresSelecionados.includes(j.id))
              .map((j) => {
                const sel = jogadoresSelecionados.includes(j.id);
                return (
                  <TouchableOpacity
                    key={j.id}
                    style={[styles.chip, sel && styles.chipSel]}
                    onPress={() => toggleJogador(j.id)}
                  >
                    <Text style={[styles.chipText, sel && styles.chipTextSel]}>{j.nome}</Text>
                  </TouchableOpacity>
                );
              })}
          </View>

          <TouchableOpacity style={styles.btnSecundario} onPress={adicionarTime}>
            <Text style={styles.btnSecundarioText}>+ Adicionar Time</Text>
          </TouchableOpacity>

          {times.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Times ({times.length})</Text>
              {times.map((t) => (
                <View key={t.id} style={styles.timeCard}>
                  <View style={styles.timeCardHeader}>
                    <Text style={styles.timeNome}>{t.nome}</Text>
                    <TouchableOpacity onPress={() => setTimes(prev => prev.filter(x => x.id !== t.id))}>
                      <Text style={styles.btnRemover}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.jogadoresGrid}>
                    {t.jogadores.map((j) => (
                      <View key={j.id} style={styles.chip}>
                        <Text style={styles.chipText}>{j.nome}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </>
          )}

          <TouchableOpacity style={styles.btnPrimario} onPress={iniciarCampeonato}>
            <Text style={styles.btnPrimarioText}>🏆 Iniciar Campeonato</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Tela principal ──
  const classificacao = calcularClassificacaoFn(campeonato);
  const confrontosGrupo = campeonato.confrontos.filter(c => c.fase === 'grupo');
  const confrontosSemi = campeonato.confrontos.filter(c => c.fase === 'semi');
  const confrontoTerceiro = campeonato.confrontos.find(c => c.fase === 'terceiro');
  const confrontoFinal = campeonato.confrontos.find(c => c.fase === 'final');

  const renderConfrontoCard = (c: Confronto) => {
    const finalizado = !!c.vencedorId;
    const vencedor = finalizado ? (c.vencedorId === c.timeA.id ? c.timeA : c.timeB) : null;
    const perdedor = finalizado ? (c.vencedorId === c.timeA.id ? c.timeB : c.timeA) : null;
    const pVenc = finalizado ? (c.vencedorId === c.timeA.id ? c.placarA : c.placarB) : null;
    const pPerd = finalizado ? (c.vencedorId === c.timeA.id ? c.placarB : c.placarA) : null;

    if (finalizado) {
      return (
        <View key={c.id} style={[styles.confrontoCard, styles.confrontoFinalizado]}>
          <View style={styles.placarRow}>
            <View style={styles.placarTimeWrap}>
              <Text style={styles.placarVencedorNome}>{vencedor!.nome}</Text>
              <Text style={styles.placarVencedorEmoji}>🏆</Text>
            </View>
            <View style={styles.placarBox}>
              <Text style={styles.placarNumVencedor}>{pVenc}</Text>
              <Text style={styles.placarSep}>×</Text>
              <Text style={styles.placarNumPerdedor}>{pPerd}</Text>
            </View>
            <View style={styles.placarTimeWrap}>
              <Text style={styles.placarPerdedorNome}>{perdedor!.nome}</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View key={c.id} style={styles.confrontoCard}>
        <Text style={styles.confrontoInstrucao}>Toque no time vencedor para registrar o placar</Text>
        <View style={styles.confrontoTimesRow}>
          <TouchableOpacity
            style={styles.btnTimeVencedor}
            onPress={() => abrirModalPlacar(c)}
          >
            <Text style={styles.btnTimeVencedorNome}>{c.timeA.nome}</Text>
            <Text style={styles.btnTimeVencedorSub}>Registrar Placar</Text>
          </TouchableOpacity>
          <Text style={styles.confrontoVs}>VS</Text>
          <TouchableOpacity
            style={styles.btnTimeVencedor}
            onPress={() => abrirModalPlacar(c)}
          >
            <Text style={styles.btnTimeVencedorNome}>{c.timeB.nome}</Text>
            <Text style={styles.btnTimeVencedorSub}>Registrar Placar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.btnVoltar} onPress={() => navegar('home')}>
          <Text style={styles.btnVoltarText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏆 {campeonato.nome}</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.abas}>
        {(['chaveamento', 'ranking', 'times'] as Aba[]).map((a) => (
          <TouchableOpacity
            key={a}
            style={[styles.aba, aba === a && styles.abaAtiva]}
            onPress={() => setAba(a)}
          >
            <Text style={[styles.abaText, aba === a && styles.abaTextAtiva]}>
              {a === 'times' ? 'Times' : a === 'chaveamento' ? 'Jogos' : 'Ranking'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ABA JOGOS */}
        {aba === 'chaveamento' && (
          <>
            {/* Fase de grupos */}
            <Text style={styles.sectionTitle}>📋 Fase de Grupos</Text>
            {confrontosGrupo.map(renderConfrontoCard)}

            {/* Semifinal */}
            {confrontosSemi.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>⚡ Semifinal</Text>
                {confrontosSemi.map(renderConfrontoCard)}
              </>
            )}

            {/* Disputa de 3º */}
            {confrontoTerceiro && (
              <>
                <Text style={styles.sectionTitle}>🥉 Disputa de 3º Lugar</Text>
                {renderConfrontoCard(confrontoTerceiro)}
              </>
            )}

            {/* Final */}
            {confrontoFinal && (
              <>
                <Text style={styles.sectionTitle}>🏆 Final</Text>
                {renderConfrontoCard(confrontoFinal)}
              </>
            )}

            {/* Campeonato encerrado */}
            {campeonato.fase === 'encerrado' && (() => {
              const campeao = confrontoFinal?.vencedorId === confrontoFinal?.timeA.id
                ? confrontoFinal?.timeA : confrontoFinal?.timeB;
              return (
                <View style={styles.campeonatoFim}>
                  <Text style={styles.campeonatoFimTexto}>🎉 {campeao?.nome} é Campeão!</Text>
                  <Text style={styles.campeonatoFimSub}>Veja o ranking final na aba Ranking</Text>
                </View>
              );
            })()}
          </>
        )}

        {/* ABA RANKING */}
        {aba === 'ranking' && (
          <>
            <Text style={styles.sectionTitle}>📊 Classificação — Fase de Grupos</Text>
            <View style={styles.tabelaHeader}>
              <Text style={[styles.tabelaCell, { flex: 2 }]}>Time</Text>
              <Text style={styles.tabelaCell}>J</Text>
              <Text style={styles.tabelaCell}>V</Text>
              <Text style={styles.tabelaCell}>D</Text>
              <Text style={styles.tabelaCell}>PTS</Text>
              <Text style={styles.tabelaCell}>SLD</Text>
            </View>
            {classificacao.map((r, idx) => (
              <View key={r.time.id} style={[styles.tabelaRow, idx < 4 && styles.tabelaRowTop4]}>
                <View style={[{ flex: 2 }, styles.tabelaCellNomeWrap]}>
                  <Text style={styles.tabelaPosicao}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`}
                  </Text>
                  <Text style={styles.tabelaNome} numberOfLines={1}>{r.time.nome}</Text>
                </View>
                <Text style={styles.tabelaCell}>{r.jogos}</Text>
                <Text style={styles.tabelaCell}>{r.vitorias}</Text>
                <Text style={styles.tabelaCell}>{r.derrotas}</Text>
                <Text style={[styles.tabelaCell, styles.tabelaCellPts]}>{r.pontos}</Text>
                <Text style={[styles.tabelaCell, r.saldo >= 0 ? styles.saldoPos : styles.saldoNeg]}>
                  {r.saldo > 0 ? `+${r.saldo}` : r.saldo}
                </Text>
              </View>
            ))}
            {classificacao.length >= 4 && (
              <Text style={styles.classificacaoNota}>⚡ Top 4 avançam para a semifinal</Text>
            )}

            {/* Resultado final se encerrado */}
            {campeonato.fase === 'encerrado' && confrontoFinal?.vencedorId && confrontoTerceiro?.vencedorId && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🏆 Resultado Final</Text>
                {[
                  { emoji: '🥇', time: confrontoFinal.vencedorId === confrontoFinal.timeA.id ? confrontoFinal.timeA : confrontoFinal.timeB },
                  { emoji: '🥈', time: confrontoFinal.vencedorId === confrontoFinal.timeA.id ? confrontoFinal.timeB : confrontoFinal.timeA },
                  { emoji: '🥉', time: confrontoTerceiro.vencedorId === confrontoTerceiro.timeA.id ? confrontoTerceiro.timeA : confrontoTerceiro.timeB },
                  { emoji: '4º', time: confrontoTerceiro.vencedorId === confrontoTerceiro.timeA.id ? confrontoTerceiro.timeB : confrontoTerceiro.timeA },
                ].map((item, idx) => (
                  <View key={idx} style={[styles.rankCard, idx === 0 && styles.rankCardPrimeiro]}>
                    <Text style={styles.rankPos}>{item.emoji}</Text>
                    <Text style={[styles.rankNome, idx === 0 && styles.rankNomePrimeiro]}>{item.time.nome}</Text>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* ABA TIMES */}
        {aba === 'times' && (
          <>
            {campeonato.times.map((t) => (
              <View key={t.id} style={styles.timeCard}>
                <Text style={styles.timeNome}>{t.nome}</Text>
                <View style={styles.jogadoresGrid}>
                  {t.jogadores.map((j) => (
                    <View key={j.id} style={styles.chip}>
                      <Text style={styles.chipText}>{j.nome}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.btnEncerrar} onPress={handleEncerrar}>
          <Text style={styles.btnEncerrarText}>🔴 Encerrar Campeonato</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de placar */}
      <Modal visible={modalPlacar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Registrar Placar</Text>
            {confrontoSelecionado && (
              <>
                <Text style={styles.modalSubtitle}>
                  {confrontoSelecionado.timeA.nome} × {confrontoSelecionado.timeB.nome}
                </Text>
                <View style={styles.modalPlacarRow}>
                  <View style={styles.modalPlacarItem}>
                    <Text style={styles.modalPlacarLabel}>{confrontoSelecionado.timeA.nome}</Text>
                    <TextInput
                      style={styles.modalPlacarInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#999"
                      value={placarA}
                      onChangeText={setPlacarA}
                    />
                  </View>
                  <Text style={styles.modalPlacarVs}>×</Text>
                  <View style={styles.modalPlacarItem}>
                    <Text style={styles.modalPlacarLabel}>{confrontoSelecionado.timeB.nome}</Text>
                    <TextInput
                      style={styles.modalPlacarInput}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#999"
                      value={placarB}
                      onChangeText={setPlacarB}
                    />
                  </View>
                </View>
              </>
            )}
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={confirmarPlacar}>
                <Text style={styles.modalBtnSalvarText}>✓ Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalPlacar(false)}>
                <Text style={styles.modalBtnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  btnVoltar: {
    backgroundColor: '#1e3a5f', width: 44, height: 44,
    borderRadius: 22, justifyContent: 'center', alignItems: 'center',
  },
  btnVoltarText: { color: '#fff', fontSize: 20 },
  abas: {
    flexDirection: 'row', backgroundColor: '#0d1f3c',
    borderBottomWidth: 1, borderBottomColor: '#1e3a5f',
  },
  aba: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  abaAtiva: { borderBottomWidth: 2, borderBottomColor: '#f5a623' },
  abaText: { color: '#6b7280', fontSize: 13, fontWeight: '600' },
  abaTextAtiva: { color: '#f5a623' },
  content: { padding: 16, paddingBottom: 40 },
  label: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 12 },
  sectionTitle: {
    color: '#f5a623', fontWeight: 'bold', fontSize: 15,
    marginTop: 16, marginBottom: 10,
  },
  input: {
    backgroundColor: '#0d1f3c', borderRadius: 10,
    borderWidth: 1, borderColor: '#1e3a5f',
    color: '#fff', paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, marginBottom: 8,
  },
  jogadoresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { backgroundColor: '#1e3a5f', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipSel: { backgroundColor: '#f5a623' },
  chipText: { color: '#94a3b8', fontSize: 13 },
  chipTextSel: { color: '#0a1628', fontWeight: 'bold' },
  timeCard: {
    backgroundColor: '#0d1f3c', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e3a5f', padding: 14, marginBottom: 10,
  },
  timeCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  timeNome: { color: '#f5a623', fontWeight: 'bold', fontSize: 15, marginBottom: 8 },
  btnRemover: { color: '#ef4444', fontSize: 18, paddingHorizontal: 8 },
  confrontoCard: {
    backgroundColor: '#0d1f3c', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e3a5f', padding: 14, marginBottom: 10,
  },
  confrontoFinalizado: { borderColor: '#1e3a5f', backgroundColor: '#0a1f38' },
  confrontoInstrucao: {
    color: '#94a3b8', fontSize: 11, textAlign: 'center', marginBottom: 10,
  },
  confrontoTimesRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8,
  },
  confrontoVs: { color: '#f5a623', fontWeight: 'bold', fontSize: 18 },
  btnTimeVencedor: {
    flex: 1, backgroundColor: '#1e3a5f', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2a4a7f',
  },
  btnTimeVencedorNome: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  btnTimeVencedorSub: { color: '#f5a623', fontSize: 11, marginTop: 4 },
  placarRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  placarTimeWrap: { flex: 1, alignItems: 'center' },
  placarVencedorNome: { color: '#22c55e', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  placarVencedorEmoji: { fontSize: 16, marginTop: 2 },
  placarPerdedorNome: { color: '#6b7280', fontSize: 13, textAlign: 'center' },
  placarBox: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  placarNumVencedor: { color: '#22c55e', fontWeight: 'bold', fontSize: 26 },
  placarSep: { color: '#94a3b8', fontSize: 18 },
  placarNumPerdedor: { color: '#6b7280', fontSize: 26, fontWeight: 'bold' },
  tabelaHeader: {
    flexDirection: 'row', backgroundColor: '#0d1f3c',
    borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10,
    marginBottom: 4, borderWidth: 1, borderColor: '#1e3a5f',
  },
  tabelaRow: {
    flexDirection: 'row', backgroundColor: '#0a1628',
    borderRadius: 8, paddingVertical: 10, paddingHorizontal: 10,
    marginBottom: 3, borderWidth: 1, borderColor: '#0d1f3c',
    alignItems: 'center',
  },
  tabelaRowTop4: { borderColor: '#1e3a5f', backgroundColor: '#0d1f3c' },
  tabelaCell: { flex: 1, color: '#94a3b8', fontSize: 13, textAlign: 'center' },
  tabelaCellPts: { color: '#f5a623', fontWeight: 'bold' },
  tabelaCellNomeWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tabelaPosicao: { fontSize: 14 },
  tabelaNome: { color: '#fff', fontWeight: 'bold', fontSize: 13, flex: 1 },
  saldoPos: { color: '#22c55e', fontWeight: 'bold' },
  saldoNeg: { color: '#ef4444', fontWeight: 'bold' },
  classificacaoNota: {
    color: '#60a5fa', fontSize: 12, textAlign: 'center', marginTop: 8,
  },
  rankCard: {
    backgroundColor: '#0d1f3c', borderRadius: 12,
    borderWidth: 1, borderColor: '#1e3a5f',
    padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  rankCardPrimeiro: { borderColor: '#f5a623', backgroundColor: '#1a2d1a' },
  rankPos: { fontSize: 22, width: 32, textAlign: 'center' },
  rankNome: { color: '#fff', fontWeight: 'bold', fontSize: 15, flex: 1 },
  rankNomePrimeiro: { color: '#f5a623' },
  btnPrimario: {
    backgroundColor: '#f5a623', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 16,
  },
  btnPrimarioText: { color: '#0a1628', fontWeight: 'bold', fontSize: 16 },
  btnSecundario: {
    backgroundColor: 'transparent', borderWidth: 2, borderColor: '#f5a623',
    borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 8,
  },
  btnSecundarioText: { color: '#f5a623', fontWeight: 'bold', fontSize: 14 },
  btnEncerrar: {
    backgroundColor: 'transparent', borderWidth: 2, borderColor: '#ef4444',
    borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24,
  },
  btnEncerrarText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
  campeonatoFim: { alignItems: 'center', paddingVertical: 24 },
  campeonatoFimTexto: { color: '#f5a623', fontSize: 20, fontWeight: 'bold' },
  campeonatoFimSub: { color: '#94a3b8', fontSize: 14, marginTop: 6 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: { backgroundColor: '#0d1f3c', borderRadius: 16, padding: 24, width: '85%' },
  modalTitle: { color: '#f5a623', fontSize: 18, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  modalSubtitle: { color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 20 },
  modalPlacarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 24 },
  modalPlacarItem: { alignItems: 'center', flex: 1 },
  modalPlacarLabel: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginBottom: 8, textAlign: 'center' },
  modalPlacarInput: {
    backgroundColor: '#1e3a5f', borderRadius: 10, borderWidth: 1, borderColor: '#2a4a7f',
    color: '#fff', fontSize: 28, fontWeight: 'bold',
    paddingVertical: 12, width: 80, textAlign: 'center',
  },
  modalPlacarVs: { color: '#f5a623', fontWeight: 'bold', fontSize: 22 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalBtnSalvar: {
    flex: 1, backgroundColor: '#22c55e', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center',
  },
  modalBtnSalvarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modalBtnCancelar: {
    flex: 1, backgroundColor: '#1e3a5f', borderRadius: 8,
    paddingVertical: 12, alignItems: 'center',
  },
  modalBtnCancelarText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 15 },
});