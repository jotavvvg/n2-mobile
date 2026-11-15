import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ResponsiveLayout from '../components/ResponsiveLayout';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import FeedbackBanner from '../components/FeedbackBanner';
import useResponsive from '../hooks/useResponsive';
import { request } from '../config/api';
import { validateRegistration } from '../utils/validation';
import { colors, radii, spacing, typography } from '../theme/tokens';

export default function CadastroScreen({ navigation }) {
  const { isDesktop } = useResponsive();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!sucesso) return undefined;
    const timer = setTimeout(() => navigation.navigate('Login', { emailCadastrado: email.trim() }), 800);
    return () => clearTimeout(timer);
  }, [email, navigation, sucesso]);

  async function cadastrar() {
    const validationError = validateRegistration({ nome, email, senha });
    setErro(validationError);
    if (validationError) return;
    setLoading(true);
    try {
      await request('/usuarios/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim(), senha }),
      });
      setSucesso(true);
    } catch (error) { setErro(error.message); } finally { setLoading(false); }
  }

  return (
    <ResponsiveLayout navigation={navigation} onBack={() => navigation.navigate('Login')}>
      <View style={[styles.authCard, isDesktop && styles.authDesktop]}>
        {isDesktop ? (
          <View style={styles.branding}>
            <Text style={styles.brand}>delivery<Text style={styles.brandingAccent}>ads</Text></Text>
            <Text style={styles.heroTitle}>Um novo jeito de pedir suas refeições favoritas.</Text>
            <Text style={styles.heroText}>Crie sua conta e tenha tudo pronto para o próximo pedido.</Text>
          </View>
        ) : <Text style={styles.mobileBrand}>delivery<Text style={styles.brandAccent}>ads</Text></Text>}
        <View style={styles.form}>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>Cadastre-se para pedir suas refeições favoritas.</Text>
          <FeedbackBanner message={erro} variant="error" />
          <FeedbackBanner message={sucesso ? 'Cadastro realizado com sucesso! Redirecionando...' : ''} variant="success" />
          <AppInput label="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome" editable={!loading && !sucesso} />
          <AppInput label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" editable={!loading && !sucesso} />
          <AppInput label="Senha" value={senha} onChangeText={setSenha} placeholder="Crie uma senha" secureTextEntry editable={!loading && !sucesso} />
          {!sucesso ? <AppButton title="Cadastrar" onPress={cadastrar} loading={loading} style={styles.submit} /> : null}
        </View>
      </View>
    </ResponsiveLayout>
  );
}

const styles = StyleSheet.create({
  authCard: { alignSelf: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, flex: 1, maxWidth: 1050, overflow: 'hidden', width: '100%' },
  authDesktop: { flexDirection: 'row', marginVertical: spacing.lg, minHeight: 560 },
  branding: { backgroundColor: colors.primary, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  brand: { color: colors.surface, fontSize: 22, fontWeight: '800', marginBottom: spacing.xxl },
  brandAccent: { color: colors.primary },
  brandingAccent: { color: colors.surface },
  heroTitle: { color: colors.surface, fontSize: 30, fontWeight: '800', lineHeight: 38 },
  heroText: { color: '#FEE2E2', fontSize: 16, lineHeight: 24, marginTop: spacing.lg },
  mobileBrand: { color: colors.primary, fontSize: 22, fontWeight: '800', padding: spacing.lg },
  form: { flex: 1, justifyContent: 'center', padding: spacing.xxl },
  title: { ...typography.h1, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.lg },
  submit: { marginTop: spacing.sm },
});
