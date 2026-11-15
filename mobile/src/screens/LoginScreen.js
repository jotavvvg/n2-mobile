import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { request } from '../config/api';

export default function LoginScreen({ navigation, route }) {
  const [email, setEmail] = useState(route.params?.emailCadastrado || '');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setEmail(route.params?.emailCadastrado || '');
  }, [route.params?.emailCadastrado]);

  async function entrar() {
    setErro('');
    if (!email.trim() || !senha) {
      setErro('Informe seu e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      const data = await request('/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), senha }),
      });
      navigation.replace('Home', { usuario: data.usuario });
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.brand}>Delivery ADS</Text>
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Entre para descobrir o que pedir hoje.</Text>
        <TextInput
          accessibilityLabel="E-mail"
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!loading}
        />
        <TextInput
          accessibilityLabel="Senha"
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          editable={!loading}
        />
        {erro ? <Text accessibilityRole="alert" style={styles.error}>{erro}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={entrar} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Cadastro')}>
          <Text style={styles.link}>Criar nova conta (Cadastre-se)</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#ECEDEF',
    borderRadius: 18,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: 'center',
    marginVertical: 8,
    maxWidth: 480,
    padding: 28,
    width: '100%',
  },
  brand: { color: '#E63946', fontSize: 16, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase' },
  title: { color: '#202124', fontSize: 30, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#60656B', fontSize: 15, marginBottom: 24 },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE1E5',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  button: { alignItems: 'center', backgroundColor: '#E63946', borderRadius: 10, marginTop: 8, padding: 15 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  linkButton: { alignItems: 'center', padding: 16 },
  link: { color: '#C92A35', fontSize: 14, fontWeight: '600' },
  error: { color: '#B42318', marginBottom: 12 },
});
