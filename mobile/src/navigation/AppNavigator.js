import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CadastroScreen from '../screens/CadastroScreen';
import CardapioScreen from '../screens/CardapioScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PedidoScreen from '../screens/PedidoScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
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
    </Stack.Navigator>
  );
}
