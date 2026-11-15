import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { linking } from './src/navigation/linking';
import { SessionProvider } from './src/auth/SessionContext';

export default function App() {
  return (
    <SessionProvider>
      <NavigationContainer linking={linking}>
        <StatusBar style="light" backgroundColor="#E63946" />
        <AppNavigator />
      </NavigationContainer>
    </SessionProvider>
  );
}
