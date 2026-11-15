import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import ResponsiveLayout from '../components/ResponsiveLayout';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import FeedbackBanner from '../components/FeedbackBanner';
import useResponsive from '../hooks/useResponsive';
import { request } from '../config/api';
import { validateAddress } from '../utils/validation';
import { useSession } from '../auth/SessionContext';
import { colors, radii, spacing, typography } from '../theme/tokens';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PedidoScreen({ navigation, route }) {
  const params = route.params || {};
  const { usuario: sessionUser } = useSession();
  const usuario = params.usuario || sessionUser;
  const { estabelecimento } = params;
  const itensSelecionados = params.itensSelecionados || [];
  const { isDesktop } = useResponsive();
  const [enderecoEntrega, setEnderecoEntrega] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [pedidoId, setPedidoId] = useState(null);
  const subtotal = useMemo(() => itensSelecionados.reduce((total, item) => total + item.preco_unitario * item.quantidade, 0), [itensSelecionados]);
  const taxa = Number(estabelecimento?.taxa_entrega || 0);
  const valorTotal = subtotal + taxa;

  async function finalizarPedido() {
    const validationError = validateAddress(enderecoEntrega);
    setErro(validationError);
    if (validationError) return;
    if (!Number.isInteger(Number(usuario.id)) || !Number.isInteger(Number(estabelecimento.id)) || itensSelecionados.some((item) => (
      !Number.isInteger(Number(item.produto_id)) ||
      !Number.isInteger(Number(item.quantidade)) ||
      Number(item.quantidade) < 1 ||
      !Number.isFinite(Number(item.preco_unitario))
    ))) {
      setErro('Não foi possível validar os itens do pedido. Volte ao cardápio e tente novamente.');
      return;
    }
    setLoading(true);
    try {
      const resposta = await request('/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id, estabelecimento_id: estabelecimento.id, endereco_entrega: enderecoEntrega.trim(), valor_total: valorTotal, itens: itensSelecionados }),
      });
      setPedidoId(resposta.pedido_id);
    } catch (error) { setErro(error.message); } finally { setLoading(false); }
  }

  if (pedidoId !== null) return (
    <ResponsiveLayout navigation={navigation} usuario={usuario}>
      <View style={styles.confirmation}>
        <View style={styles.check}><CheckCircle2 color={colors.success} size={46} strokeWidth={2} /></View>
        <Text style={styles.confirmationTitle}>Pedido confirmado!</Text>
        <Text style={styles.confirmationText}>Pedido #{pedidoId} registrado para entrega em {enderecoEntrega}.</Text>
        <AppButton title="Acompanhar / Voltar ao início" onPress={() => navigation.navigate('Home', { usuario, ultimoPedidoId: pedidoId })} style={styles.confirmButton} />
      </View>
    </ResponsiveLayout>
  );

  if (!usuario || !estabelecimento || !itensSelecionados.length) return (
    <ResponsiveLayout navigation={navigation}>
      <View style={styles.confirmation}><Text style={styles.confirmationTitle}>Pedido não encontrado</Text><Text style={styles.confirmationText}>Volte ao cardápio para montar seu pedido.</Text><AppButton title="Ir para o início" onPress={() => navigation.navigate('Home')} /></View>
    </ResponsiveLayout>
  );

  return (
    <ResponsiveLayout navigation={navigation} usuario={usuario} onBack={() => navigation.goBack()}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>FINALIZAÇÃO</Text>
        <Text style={styles.title}>Revise seu pedido</Text>
        <Text style={styles.establishment}>{estabelecimento.nome}</Text>
        <View style={[styles.layout, isDesktop && styles.desktopLayout]}>
          <View style={styles.left}>
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Onde entregar?</Text>
              <AppInput label="Endereço de entrega" value={enderecoEntrega} onChangeText={setEnderecoEntrega} placeholder="Rua, número, complemento e bairro" error={erro} editable={!loading} multiline />
            </View>
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Revisão dos itens</Text>
              {itensSelecionados.map((item) => (
                <View key={item.produto_id} style={styles.itemRow}>
                  <View style={styles.quantityBadge}><Text style={styles.quantityBadgeText}>{item.quantidade}x</Text></View>
                  <View style={styles.itemDescription}><Text style={styles.itemName}>{item.nome}</Text><Text style={styles.caption}>{formatCurrency(item.preco_unitario)} cada</Text></View>
                  <Text style={styles.itemPrice}>{formatCurrency(item.preco_unitario * item.quantidade)}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.panel, styles.summary]}>
            <Text style={styles.panelTitle}>Resumo do pagamento</Text>
            <View style={styles.line}><Text style={styles.caption}>Subtotal dos itens</Text><Text>{formatCurrency(subtotal)}</Text></View>
            <View style={styles.line}><Text style={styles.caption}>Taxa de entrega</Text><Text>{formatCurrency(taxa)}</Text></View>
            <View style={[styles.line, styles.totalLine]}><Text style={styles.totalLabel}>Total a pagar</Text><Text style={styles.total}>{formatCurrency(valorTotal)}</Text></View>
            <FeedbackBanner message={erro} variant="error" />
            <AppButton title={`Finalizar pedido · ${formatCurrency(valorTotal)}`} onPress={finalizarPedido} loading={loading} style={styles.submit} />
          </View>
        </View>
      </ScrollView>
    </ResponsiveLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xl },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { ...typography.h1, marginTop: spacing.sm },
  establishment: { ...typography.body, marginTop: spacing.xs },
  layout: { marginTop: spacing.lg },
  desktopLayout: { flexDirection: 'row', gap: spacing.lg },
  left: { flex: 1.2 },
  panel: { backgroundColor: colors.surface, borderRadius: radii.lg, marginBottom: spacing.lg, padding: spacing.lg },
  summary: { flex: 0.8 },
  panelTitle: { ...typography.h3, marginBottom: spacing.md },
  itemRow: { alignItems: 'center', backgroundColor: colors.background, borderColor: colors.border, borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', marginBottom: spacing.sm, padding: spacing.md },
  quantityBadge: { alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: radii.sm, height: 32, justifyContent: 'center', marginRight: spacing.sm, width: 40 },
  quantityBadgeText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  itemDescription: { flex: 1, marginRight: spacing.md },
  itemName: { ...typography.bodyBold },
  caption: { ...typography.caption },
  itemPrice: { ...typography.bodyBold },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  totalLine: { borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacing.sm, paddingTop: spacing.md },
  totalLabel: { ...typography.h2 },
  total: { ...typography.price, fontSize: 20 },
  submit: { marginTop: spacing.md },
  confirmation: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: spacing.xl },
  check: { alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: 40, height: 80, justifyContent: 'center', width: 80 },
  confirmationTitle: { ...typography.h1, marginTop: spacing.lg, textAlign: 'center' },
  confirmationText: { ...typography.body, marginTop: spacing.sm, textAlign: 'center' },
  confirmButton: { marginTop: spacing.lg },
});
