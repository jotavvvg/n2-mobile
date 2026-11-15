import { StyleSheet, Text, View } from 'react-native';
import AppButton from './AppButton';
import { colors, spacing, typography } from '../theme/tokens';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CartSummaryBar({ quantity, subtotal, onPress, title = 'Revisar pedido' }) {
  if (!quantity) return null;

  return (
    <View style={styles.bar}>
      <View>
        <Text style={styles.quantity}>{quantity} {quantity === 1 ? 'item' : 'itens'}</Text>
        <Text style={styles.total}>{formatCurrency(subtotal)}</Text>
      </View>
      <AppButton title={title} variant="outline" onPress={onPress} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    padding: spacing.md,
    position: 'absolute',
    right: 0,
    zIndex: 2,
  },
  quantity: { color: colors.surface, fontWeight: '700' },
  total: { color: colors.surface, marginTop: spacing.xs },
  button: { backgroundColor: colors.surface, minHeight: 42, paddingVertical: spacing.sm },
});
