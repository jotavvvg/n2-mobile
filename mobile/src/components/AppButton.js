import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.surface : colors.primary} />
      ) : (
        <Text
          style={[
            styles.label,
            isPrimary && styles.primaryLabel,
            isOutline && styles.outlineLabel,
            variant === 'ghost' && styles.ghostLabel,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radii.md,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1 },
  ghost: { backgroundColor: 'transparent' },
  label: { ...typography.bodyBold },
  primaryLabel: { color: colors.surface },
  outlineLabel: { color: colors.primary },
  ghostLabel: { color: colors.textSecondary },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
});
