import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function StoreCard({ store, image, onPress, style }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir cardápio de ${store.nome}`}
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.card,
        style,
        hovered && styles.hovered,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageWrap}>
        <Image source={image} style={styles.image} resizeMode="cover" accessibilityLabel={store.nome} />
        <Text style={styles.deliveryTime}>{store.tempo_estimado}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>{store.nome}</Text>
          <View style={styles.rating}>
            <Star color={colors.secondary} fill={colors.secondary} size={13} strokeWidth={2} />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text numberOfLines={1} style={styles.category}>{store.categoria}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={[styles.fee, Number(store.taxa_entrega) === 0 && styles.freeFee]}>
            {Number(store.taxa_entrega) === 0 ? 'Entrega Grátis' : `Entrega ${formatCurrency(store.taxa_entrega)}`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flex: 1,
    minWidth: 0,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  hovered: { borderColor: '#D1D5DB', transform: [{ translateY: -2 }] },
  pressed: { opacity: 0.86 },
  imageWrap: { height: 160, position: 'relative', width: '100%' },
  image: { height: '100%', width: '100%' },
  deliveryTime: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    bottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    position: 'absolute',
    right: spacing.sm,
  },
  body: { padding: spacing.md },
  titleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  title: { ...typography.h3, flex: 1, marginRight: spacing.sm },
  rating: { alignItems: 'center', flexDirection: 'row' },
  ratingText: { color: '#B77905', fontSize: 12, fontWeight: '700', marginLeft: spacing.xs },
  footer: { alignItems: 'center', flexDirection: 'row', marginTop: spacing.sm },
  category: { ...typography.caption, flexShrink: 1 },
  separator: { color: colors.textMuted, marginHorizontal: spacing.sm },
  fee: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  freeFee: { color: colors.success },
});
