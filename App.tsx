import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import ListaScreen from './screens/ListaScreen';
import PeladaScreen from './screens/PeladaScreen';
import RankingScreen from './screens/RankingScreen';
import CampeonatoScreen from './screens/CampeonatoScreen';

export type Screen = 'home' | 'lista' | 'pelada' | 'ranking' | 'campeonato';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  const renderScreen = () => {
    switch (screen) {
      case 'home':     return <HomeScreen navegar={setScreen} />;
      case 'lista':    return <ListaScreen navegar={setScreen} />;
      case 'pelada':   return <PeladaScreen navegar={setScreen} />;
      case 'ranking':  return <RankingScreen navegar={setScreen} />;
      case 'campeonato': return <CampeonatoScreen navegar={setScreen} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1628" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1628' },
});