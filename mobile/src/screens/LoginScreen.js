import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Fish, Pizza, Sparkles, Utensils } from 'lucide-react-native';
import ResponsiveLayout from '../components/ResponsiveLayout';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import FeedbackBanner from '../components/FeedbackBanner';
import useResponsive from '../hooks/useResponsive';
import { request } from '../config/api';
import { validateLogin } from '../utils/validation';
import { useSession } from '../auth/SessionContext';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';

function BrandingPanel() {
  return (
    <View style={styles.branding}>
      <Text style={styles.brand}>delivery<Text style={styles.brandingAccent}>ads</Text></Text>
      <Text style={styles.heroTitle}>Sua comida favorita, do banco de dados direto para sua mesa.</Text>
      <Text style={styles.heroText}>Descubra restaurantes, monte sua sacola e acompanhe seu pedido com praticidade.</Text>
      <View style={styles.badges}>
        <Utensils color={colors.surface} size={26} strokeWidth={2} />
        <Pizza color={colors.surface} size={26} strokeWidth={2} />
        <Fish color={colors.surface} size={26} strokeWidth={2} />
        <Sparkles color={colors.surface} size={26} strokeWidth={2} />
      </View>
    </View>
  );
}

export default function LoginScreen({ navigation, route }) {
  const { isDesktop } = useResponsive();
  const { hydrated, signIn, usuario: sessionUser } = useSession();
  const [email, setEmail] = useState(route.params?.emailCadastrado || '');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => setEmail(route.params?.emailCadastrado || ''), [route.params?.emailCadastrado]);
  useEffect(() => {
    if (hydrated && sessionUser && !route.params?.emailCadastrado) {
      navigation.replace('Home', { usuario: sessionUser });
    }
  }, [hydrated, navigation, route.params?.emailCadastrado, sessionUser]);

  async function entrar() {
    const validationError = validateLogin({ email, senha });
    setErro(validationError);
    if (validationError) return;
    setLoading(true);
    try {
      const data = await request('/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), senha }),
      });
      await signIn(data.usuario);
      navigation.replace('Home', { usuario: data.usuario });
    } catch (error) {
      setErro(error.message);
    } finally { setLoading(false); }
  }

  return (
    <ResponsiveLayout navigation={navigation}>
      <View style={[styles.authCard, isDesktop && styles.authDesktop]}>
        {isDesktop ? <BrandingPanel /> : <Text style={styles.mobileBrand}>delivery<Text style={styles.brandAccent}>ads</Text></Text>}
        <View style={styles.form}>
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Entre para descobrir o que pedir hoje.</Text>
          {route.params?.emailCadastrado ? <FeedbackBanner message="Conta criada! Digite sua senha para entrar." variant="success" /> : null}
          <FeedbackBanner message={erro} variant="error" />
          <AppInput label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoComplete="email" editable={!loading} />
          <AppInput label="Senha" value={senha} onChangeText={setSenha} placeholder="Sua senha" secureTextEntry editable={!loading} />
          <AppButton title="Entrar" onPress={entrar} loading={loading} style={styles.submit} />
          <AppButton title="Criar nova conta (Cadastre-se)" variant="ghost" onPress={() => navigation.navigate('Cadastro')} />
        </View>
      </View>
    </ResponsiveLayout>
  );
}

const styles = StyleSheet.create({
  authCard: { alignSelf: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, flex: 1, maxWidth: 1050, overflow: 'hidden', width: '100%' },
  authDesktop: { flexDirection: 'row', marginVertical: spacing.lg, minHeight: 560, ...shadows.card },
  branding: { backgroundColor: colors.primary, flex: 1, justifyContent: 'center', padding: spacing.xxl },
  brand: { color: colors.surface, fontSize: 22, fontWeight: '800', marginBottom: spacing.xxl },
  brandAccent: { color: colors.primary },
  brandingAccent: { color: colors.surface },
  heroTitle: { color: colors.surface, fontSize: 32, fontWeight: '800', lineHeight: 39 },
  heroText: { color: '#FEE2E2', fontSize: 16, lineHeight: 24, marginTop: spacing.lg },
  badges: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxl },
  mobileBrand: { color: colors.primary, fontSize: 22, fontWeight: '800', padding: spacing.lg },
  form: { flex: 1, justifyContent: 'center', padding: spacing.xxl },
  title: { ...typography.h1, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.lg },
  submit: { marginTop: spacing.sm, width: '100%' },
});
