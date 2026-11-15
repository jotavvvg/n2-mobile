import { Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, ClipboardList, LogIn, LogOut, MapPin } from 'lucide-react-native';
import useResponsive from '../hooks/useResponsive';
import { useSession } from '../auth/SessionContext';
import { colors, radii, spacing, typography } from '../theme/tokens';

function TopNavbar({ navigation, usuario, onBack, onLogout, compact = false }) {
  return (
    <View style={[styles.navbar, compact && styles.compactNavbar]}>
      <View style={styles.navbarInner}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delivery ADS, início"
          onPress={() => {
            if (usuario) navigation.navigate('Home', { usuario });
            else navigation.navigate('Login');
          }}
          style={({ pressed }) => [styles.brandLink, pressed && styles.pressed]}
        >
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>D</Text></View>
          <Text style={styles.brandText}>delivery<Text style={styles.brandTextAccent}>ads</Text></Text>
        </Pressable>

        {!compact ? (
          <View style={styles.address}>
            <Text style={styles.addressCaption}>ENTREGANDO EM</Text>
            <View style={styles.addressValue}>
              <MapPin color={colors.primary} size={15} strokeWidth={2.2} />
              <Text style={styles.addressText}>Campus ADS</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.navbarActions}>
          {usuario && !(compact && onBack) ? (
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.userGreeting, compact && styles.compactGreeting]}>
              Olá, {compact ? String(usuario.nome || '').split(' ')[0] : usuario.nome}
            </Text>
          ) : null}
          {usuario && !(compact && onBack) ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Pedidos', { usuario })}
              style={({ pressed }) => [styles.accountButton, compact && styles.compactAction, pressed && styles.pressed]}
            >
              <ClipboardList color={colors.primary} size={16} strokeWidth={2.2} />
              <Text style={styles.accountButtonText}>Pedidos</Text>
            </Pressable>
          ) : null}
          {usuario ? (
            <Pressable
              accessibilityRole="button"
              onPress={onLogout}
              style={({ pressed }) => [styles.logoutButton, compact && styles.compactAction, pressed && styles.pressed]}
            >
              <LogOut color={colors.textSecondary} size={16} strokeWidth={2.2} />
              <Text style={styles.logoutText}>Sair</Text>
            </Pressable>
          ) : null}
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              onPress={onBack}
              style={({ pressed }) => [styles.backButton, compact && styles.compactAction, pressed && styles.pressed]}
            >
              <ArrowLeft color={colors.textSecondary} size={16} strokeWidth={2.2} />
              <Text style={styles.backText}>Voltar</Text>
            </Pressable>
          ) : !usuario ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Login')}
              style={({ pressed }) => [styles.signInButton, pressed && styles.pressed]}
            >
              <LogIn color={colors.surface} size={16} strokeWidth={2.2} />
              <Text style={styles.signInText}>Entrar</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function ResponsiveLayout({ children, navigation, usuario, onBack }) {
  const { isMobile, isDesktop } = useResponsive();
  const { usuario: sessionUser, signOut } = useSession();
  const currentUser = usuario || sessionUser;
  const showWebNavbar = Platform.OS === 'web';

  async function logout() {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {showWebNavbar ? (
        <TopNavbar navigation={navigation} usuario={currentUser} onBack={onBack} onLogout={logout} compact={isMobile} />
      ) : null}
      <View style={styles.content}>
        <View style={[styles.contentInner, isDesktop && styles.desktopContent]}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { alignItems: 'center', flex: 1, width: '100%' },
  contentInner: {
    flex: 1,
    maxWidth: 1200,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    width: '100%',
  },
  desktopContent: { paddingHorizontal: spacing.xl },
  navbar: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    minHeight: 72,
    width: '100%',
  },
  compactNavbar: { minHeight: 56 },
  navbarInner: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 1200,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  compactGreeting: { marginLeft: spacing.sm, marginRight: 0, maxWidth: 110 },
  compactAction: { height: 34, minWidth: 76, paddingHorizontal: spacing.xs },
  accountButton: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'center',
    minWidth: 92,
    paddingHorizontal: spacing.sm,
  },
  accountButtonText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  logoutButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'center',
    minWidth: 92,
    paddingHorizontal: spacing.sm,
  },
  logoutText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  brandLink: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, paddingVertical: spacing.sm },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    height: 34,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 34,
  },
  brandMarkText: { color: colors.surface, fontSize: 20, fontWeight: '800' },
  brandText: { color: colors.textPrimary, flexShrink: 1, fontSize: 19, fontWeight: '800', letterSpacing: -0.7 },
  brandTextAccent: { color: colors.primary },
  address: { marginLeft: spacing.xxl },
  addressCaption: { ...typography.caption, fontSize: 10, letterSpacing: 0.7 },
  addressValue: { alignItems: 'center', flexDirection: 'row', marginTop: 2 },
  addressText: { ...typography.bodyBold, marginLeft: spacing.xs },
  navbarActions: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, gap: spacing.sm },
  userGreeting: { ...typography.caption, marginRight: spacing.md },
  backButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'center',
    minWidth: 92,
    paddingHorizontal: spacing.md,
  },
  backText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  signInButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  signInText: { color: colors.surface, fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
