import { StyleSheet, Text, View } from 'react-native';
import AppButton from './AppButton';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CartSidebar({ items, deliveryFee, onPress }) {
  const subtotal = items.reduce((total, item) => total + item.preco_unitario * item.quantidade, 0);
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Sua sacola</Text>
      {items.length === 0 ? (
        <Text style={styles.empty}>Sua sacola está vazia</Text>
      ) : (
        items.map((item) => (
          <View key={item.produto_id} style={styles.item}>
            <Text style={styles.itemName}>{item.quantidade}x {item.nome}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.preco_unitario * item.quantidade)}</Text>
          </View>
        ))
      )}
      <View style={styles.line}><Text style={styles.label}>Subtotal</Text><Text>{formatCurrency(subtotal)}</Text></View>
      <View style={styles.line}><Text style={styles.label}>Entrega</Text><Text>{formatCurrency(deliveryFee)}</Text></View>
      <View style={[styles.line, styles.totalLine]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.total}>{formatCurrency(subtotal + Number(deliveryFee || 0))}</Text>
      </View>
      <AppButton title="Revisar pedido" onPress={onPress} disabled={!items.length} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, ...shadows.card },
  title: { ...typography.h2, marginBottom: spacing.lg },
  empty: { ...typography.caption, marginBottom: spacing.lg, paddingVertical: spacing.xl, textAlign: 'center' },
  item: { backgroundColor: colors.background, borderColor: colors.border, borderRadius: radii.sm, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, padding: spacing.sm },
  itemName: { ...typography.caption, flex: 1, marginRight: spacing.sm },
  itemPrice: { ...typography.bodyBold },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm },
  label: { ...typography.caption },
  totalLine: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacing.sm, paddingTop: spacing.md },
  totalLabel: { ...typography.h3 },
  total: { ...typography.price },
  button: { marginTop: spacing.lg, width: '100%' },
});
