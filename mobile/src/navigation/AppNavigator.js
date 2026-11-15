import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import CadastroScreen from '../screens/CadastroScreen';
import CardapioScreen from '../screens/CardapioScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PedidoScreen from '../screens/PedidoScreen';
import PedidosScreen from '../screens/PedidosScreen';
import { useSession } from '../auth/SessionContext';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { hydrated, usuario } = useSession();

  if (!hydrated) {
    return <View style={styles.loading}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <Stack.Navigator
      initialRouteName={usuario ? 'Home' : 'Login'}
      screenOptions={{
        headerShown: Platform.OS !== 'web',
        headerStyle: { backgroundColor: '#E63946' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#F8F9FA' },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Cadastre-se' }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Estabelecimentos' }} />
      <Stack.Screen name="Cardapio" component={CardapioScreen} options={{ title: 'Cardápio' }} />
      <Stack.Screen name="Pedido" component={PedidoScreen} options={{ title: 'Seu pedido' }} />
      <Stack.Screen name="Pedidos" component={PedidosScreen} options={{ title: 'Meus pedidos' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center' },
});
