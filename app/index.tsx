import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Chat from '../components/Chat';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Chat />
    </SafeAreaProvider>
  );
} 