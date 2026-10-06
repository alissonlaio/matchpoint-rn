import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View, Platform } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import ListaScreen from './screens/ListaScreen';
import PeladaScreen from './screens/PeladaScreen';
import RankingScreen from './screens/RankingScreen';
import CampeonatoScreen from './screens/CampeonatoScreen';
import ViewScreen from './screens/ViewScreen';

export type Screen = 'home' | 'lista' | 'pelada' | 'ranking' | 'campeonato' | 'view';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  useEffect(() => {
    // ✅ Se acessar /view na URL, mostra a tela pública
    if (Platform.OS === 'web') {
      const path = window.location.pathname;
      if (path.includes('/view')) {
        setScreen('view');
      }
    }
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case 'home':       return <HomeScreen navegar={setScreen} />;
      case 'lista':      return <ListaScreen navegar={setScreen} />;
      case 'pelada':     return <PeladaScreen navegar={setScreen} />;
      case 'ranking':    return <RankingScreen navegar={setScreen} />;
      case 'campeonato': return <CampeonatoScreen navegar={setScreen} />;
      case 'view':       return <ViewScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050d1a" />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050d1a' },
});