import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import ResponsiveLayout from '../components/ResponsiveLayout';
import AppButton from '../components/AppButton';
import FeedbackBanner from '../components/FeedbackBanner';
import useResponsive from '../hooks/useResponsive';
import { useSession } from '../auth/SessionContext';
import { request } from '../config/api';
import { colors, radii, spacing, typography } from '../theme/tokens';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data indisponível' : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function statusLabel(status) {
  return { CONFIRMADO: 'Pedido confirmado', PREPARANDO: 'Em preparo', A_CAMINHO: 'A caminho', ENTREGUE: 'Entregue' }[status] || status || 'Em andamento';
}

export default function PedidosScreen({ navigation, route }) {
  const { usuario: sessionUser } = useSession();
  const usuario = route.params?.usuario || sessionUser;
  const { isMobile } = useResponsive();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!usuario?.id) {
      navigation.replace('Login');
      return undefined;
    }

    let ativo = true;
    setLoading(true);
    setErro('');
    request(`/pedidos?usuario_id=${encodeURIComponent(usuario.id)}`)
      .then((data) => {
        if (!Array.isArray(data)) throw new Error('A resposta de pedidos é inválida.');
        if (ativo) setPedidos(data);
      })
      .catch((error) => ativo && setErro(error.message))
      .finally(() => ativo && setLoading(false));
    return () => { ativo = false; };
  }, [navigation, refreshKey, usuario?.id]);

  return (
    <ResponsiveLayout navigation={navigation} usuario={usuario} onBack={() => navigation.goBack()}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>MINHA CONTA</Text>
        <Text style={styles.title}>Acompanhe seus pedidos</Text>
        <Text style={styles.subtitle}>Veja o status e os detalhes dos pedidos feitos por você.</Text>
      </View>
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View> : erro ? (
        <View style={styles.center}><FeedbackBanner message={erro} variant="error" /><AppButton title="Tentar novamente" onPress={() => setRefreshKey((key) => key + 1)} /></View>
      ) : pedidos.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyTitle}>Você ainda não fez pedidos.</Text><Text style={styles.emptyText}>Escolha um restaurante e monte sua primeira sacola.</Text><AppButton title="Explorar restaurantes" onPress={() => navigation.navigate('Home', { usuario })} /></View>
      ) : (
        <View style={styles.list}>
          {pedidos.map((pedido) => (
            <View key={pedido.id} style={[styles.card, isMobile && styles.mobileCard]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.restaurant}>{pedido.estabelecimento_nome}</Text>
                  <Text style={styles.meta}>Pedido #{pedido.id} · {formatDate(pedido.criado_em)}</Text>
                </View>
                <View style={styles.status}><Text style={styles.statusText}>{statusLabel(pedido.status)}</Text></View>
              </View>
              <View style={styles.items}>
                {(pedido.itens || []).map((item) => (
                  <View key={`${pedido.id}-${item.produto_id}`} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.quantidade}x {item.produto_nome}</Text>
                    <Text style={styles.itemPrice}>{formatCurrency(item.preco_unitario * item.quantidade)}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.footer}>
                <Text style={styles.address} numberOfLines={2}>Entrega: {pedido.endereco_entrega}</Text>
                <Text style={styles.total}>{formatCurrency(pedido.valor_total)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ResponsiveLayout>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.lg },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { ...typography.h1, marginTop: spacing.sm },
  subtitle: { ...typography.body, marginTop: spacing.xs },
  list: { gap: spacing.md, maxWidth: 820, width: '100%' },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, padding: spacing.lg },
  mobileCard: { padding: spacing.md },
  cardHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  restaurant: { ...typography.h3, marginRight: spacing.md },
  meta: { ...typography.caption, marginTop: spacing.xs },
  status: { backgroundColor: colors.primaryLight, borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  statusText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  items: { borderBottomColor: colors.border, borderBottomWidth: 1, borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacing.md, paddingVertical: spacing.sm },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  itemName: { ...typography.body, flex: 1, marginRight: spacing.md },
  itemPrice: { ...typography.bodyBold },
  footer: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  address: { ...typography.caption, flex: 1, marginRight: spacing.md },
  total: { ...typography.price },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.xxl },
  emptyTitle: { ...typography.h3 },
  emptyText: { ...typography.body, marginBottom: spacing.lg, marginTop: spacing.sm, textAlign: 'center' },
});
