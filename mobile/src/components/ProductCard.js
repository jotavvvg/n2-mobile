import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function QuantityStepper({ quantity, onChange }) {
  return (
    <View style={styles.stepper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Remover uma unidade"
        onPress={() => onChange(-1)}
        style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
      >
        <Minus color={colors.surface} size={16} strokeWidth={2.5} />
      </Pressable>
      <Text accessibilityLabel={`Quantidade ${quantity}`} style={styles.quantity}>{quantity}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adicionar uma unidade"
        onPress={() => onChange(1)}
        style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperPressed]}
      >
        <Plus color={colors.surface} size={16} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

export default function ProductCard({ product, image, quantity = 0, onAdd, onQuantityChange }) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.name}>{product.nome}</Text>
        {product.descricao ? (
          <Text numberOfLines={2} style={styles.description}>{product.descricao}</Text>
        ) : null}
        <Text style={styles.price}>{formatCurrency(product.preco)}</Text>
      </View>
      <View style={styles.action}>
        <Image source={image} style={styles.image} resizeMode="cover" accessibilityLabel={product.nome} />
        {quantity > 0 ? (
          <QuantityStepper quantity={quantity} onChange={onQuantityChange} />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Adicionar ${product.nome} ao pedido`}
            onPress={onAdd}
            style={({ pressed }) => [styles.addButton, pressed && styles.addPressed]}
          >
            <Plus color={colors.primary} size={15} strokeWidth={2.5} />
            <Text style={styles.addLabel}>Adicionar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 164,
    marginBottom: spacing.md,
    minWidth: 0,
    minHeight: 164,
    overflow: 'hidden',
    padding: spacing.md,
  },
  content: { flex: 1, justifyContent: 'space-between', paddingRight: spacing.md },
  name: { ...typography.bodyBold, lineHeight: 21 },
  description: { ...typography.caption, lineHeight: 19, marginTop: spacing.xs },
  price: { ...typography.price, marginTop: spacing.sm },
  action: { alignItems: 'center', justifyContent: 'space-between', width: 128 },
  image: { backgroundColor: colors.background, borderRadius: radii.md, height: 88, width: 112 },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radii.sm,
    minHeight: 36,
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    width: '100%',
  },
  addLabel: { color: colors.primary, fontSize: 12, fontWeight: '700', marginLeft: spacing.xs },
  addPressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  stepper: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    width: '100%',
  },
  stepperButton: { alignItems: 'center', height: 30, justifyContent: 'center', width: 30 },
  stepperPressed: { opacity: 0.65 },
  quantity: { color: colors.surface, fontSize: 14, fontWeight: '700' },
});
