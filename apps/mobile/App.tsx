import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>Outdoor AI</Text>
      <Text style={styles.tagline}>Look. Ask. Play.</Text>
      <Text style={styles.description}>Phase 1 · Foundation</Text>
      <Text style={styles.note}>Golf features will arrive in later phases.</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9f6', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#173d2c' },
  tagline: { fontSize: 20, marginTop: 12, color: '#173d2c' },
  description: { fontSize: 16, marginTop: 28, color: '#374151' },
  note: { fontSize: 14, marginTop: 8, color: '#4b5563', textAlign: 'center' },
});
