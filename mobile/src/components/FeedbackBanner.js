import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

const variants = {
  error: { backgroundColor: colors.errorBg, color: colors.error, Icon: AlertCircle },
  success: { backgroundColor: '#ECFDF5', color: colors.success, Icon: CheckCircle2 },
  info: { backgroundColor: '#EFF6FF', color: '#2563EB', Icon: Info },
};

export default function FeedbackBanner({ message, variant = 'info', onClose }) {
  if (!message) return null;
  const palette = variants[variant] || variants.info;
  const Icon = palette.Icon;

  return (
    <View accessibilityRole="alert" style={[styles.banner, { backgroundColor: palette.backgroundColor }]}>
      <Icon color={palette.color} size={18} strokeWidth={2.2} style={styles.icon} />
      <Text style={[styles.message, { color: palette.color }]}>{message}</Text>
      {onClose ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar mensagem" onPress={onClose}>
          <X color={palette.color} size={18} strokeWidth={2.2} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { alignItems: 'center', borderRadius: radii.md, flexDirection: 'row', marginBottom: spacing.md, padding: spacing.md },
  icon: { marginRight: spacing.sm },
  message: { ...typography.caption, flex: 1, lineHeight: 19 },
  close: { fontSize: 21, fontWeight: '600', marginLeft: spacing.sm, paddingHorizontal: spacing.xs },
});
