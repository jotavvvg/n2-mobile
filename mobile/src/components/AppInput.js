import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  editable = true,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputShell, focused && styles.inputFocused, error && styles.inputError]}>
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          autoCapitalize={inputProps.autoCapitalize || 'none'}
          editable={editable}
          onBlur={() => setFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !passwordVisible}
          style={[styles.input, inputProps.multiline && styles.multilineInput]}
          value={value}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={styles.passwordToggle}
          >
            <Text style={styles.passwordText}>{passwordVisible ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md, width: '100%' },
  label: { ...typography.caption, color: colors.textPrimary, marginBottom: spacing.sm },
  inputShell: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 50,
    paddingHorizontal: spacing.md,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.error },
  input: { color: colors.textPrimary, flex: 1, fontSize: 15, minHeight: 48, outlineStyle: 'none', outlineWidth: 0, paddingVertical: spacing.sm },
  multilineInput: { minHeight: 112, paddingTop: spacing.sm, textAlignVertical: 'top' },
  passwordToggle: { paddingLeft: spacing.sm, paddingVertical: spacing.sm },
  passwordText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  error: { color: colors.error, fontSize: 12, marginTop: spacing.xs },
});
