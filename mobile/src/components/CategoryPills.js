import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radii, spacing } from '../theme/tokens';

export default function CategoryPills({ categories, selected, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
      accessibilityLabel="Filtrar por categoria"
    >
      {categories.map((category) => {
        const active = category === selected;
        return (
          <TouchableOpacity
            key={category}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(category)}
            style={[styles.pill, active && styles.activePill]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{category}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { elevation: 2, height: 44, position: 'relative', zIndex: 2 },
  container: { alignItems: 'flex-start', flexDirection: 'row', paddingBottom: spacing.sm },
  pill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    marginRight: spacing.sm,
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  activePill: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  activeLabel: { color: colors.surface },
});
