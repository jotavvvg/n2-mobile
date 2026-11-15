import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { linking } from './src/navigation/linking';

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <StatusBar style="light" backgroundColor="#E63946" />
      <AppNavigator />
    </NavigationContainer>
  );
}
