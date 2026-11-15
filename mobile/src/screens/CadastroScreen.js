import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { request } from '../config/api';

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!sucesso) return undefined;
    const timer = setTimeout(() => {
      navigation.navigate('Login', { emailCadastrado: email.trim() });
    }, 800);
    return () => clearTimeout(timer);
  }, [email, navigation, sucesso]);

  async function cadastrar() {
    setErro('');
    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErro('Preencha seu nome, e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      await request('/usuarios/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim(), senha }),
      });
      setSucesso(true);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>Cadastre-se para pedir suas refeições favoritas.</Text>
        <TextInput
          accessibilityLabel="Nome completo"
          style={styles.input}
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
          editable={!loading && !sucesso}
        />
        <TextInput
          accessibilityLabel="E-mail"
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!loading && !sucesso}
        />
        <TextInput
          accessibilityLabel="Senha"
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          editable={!loading && !sucesso}
        />
        {erro ? <Text accessibilityRole="alert" style={styles.error}>{erro}</Text> : null}
        {sucesso ? (
          <Text style={styles.success}>Cadastro realizado com sucesso! Redirecionando...</Text>
        ) : (
          <TouchableOpacity style={styles.button} onPress={cadastrar} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
          </TouchableOpacity>
        )}
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
  title: { color: '#202124', fontSize: 28, fontWeight: '700', marginBottom: 8 },
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
  error: { color: '#B42318', marginBottom: 12 },
  success: { color: '#16803C', fontWeight: '600', marginTop: 8 },
});
