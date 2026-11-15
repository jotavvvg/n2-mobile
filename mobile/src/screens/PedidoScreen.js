import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { request } from '../config/api';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PedidoScreen({ navigation, route }) {
  const routeParams = route.params || {};
  const { usuario, estabelecimento } = routeParams;
  const itensSelecionados = routeParams.itensSelecionados || [];
  const { width } = useWindowDimensions();
  const [enderecoEntrega, setEnderecoEntrega] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [pedidoId, setPedidoId] = useState(null);

  const subtotal = useMemo(
    () => itensSelecionados.reduce((total, item) => total + item.preco_unitario * item.quantidade, 0),
    [itensSelecionados],
  );
  const valorTotal = subtotal + Number(estabelecimento?.taxa_entrega || 0);

  async function finalizarPedido() {
    setErro('');
    if (!enderecoEntrega.trim()) {
      setErro('Informe o endereço de entrega.');
      return;
    }

    setLoading(true);
    try {
      const resposta = await request('/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuario.id,
          estabelecimento_id: estabelecimento.id,
          endereco_entrega: enderecoEntrega.trim(),
          valor_total: valorTotal,
          itens: itensSelecionados,
        }),
      });
      setPedidoId(resposta.pedido_id);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (pedidoId !== null) {
    return (
      <ScreenContainer>
        <View style={styles.confirmation}>
          <Text style={styles.confirmationIcon}>✓</Text>
          <Text style={styles.confirmationTitle}>Pedido confirmado!</Text>
          <Text style={styles.confirmationText}>Seu pedido #{pedidoId} foi registrado com sucesso.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Home', { usuario, ultimoPedidoId: pedidoId })}
          >
            <Text style={styles.buttonText}>Voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (!usuario || !estabelecimento || itensSelecionados.length === 0) {
    return (
      <ScreenContainer>
        <View style={styles.missingOrder}>
          <Text style={styles.heading}>Pedido não encontrado</Text>
          <Text style={styles.confirmationText}>
            Este endereço não contém os dados do carrinho. Volte ao cardápio para montar seu pedido.
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.buttonText}>Ir para o início</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const desktop = width >= 900;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.orderContent}>
          <Text style={styles.eyebrow}>FINALIZAÇÃO</Text>
          <Text style={styles.heading}>Revise seu pedido</Text>
          <Text style={styles.establishment}>{estabelecimento.nome}</Text>
          <View style={[styles.checkoutLayout, desktop && styles.checkoutLayoutDesktop]}>
            <View style={[styles.panel, desktop && styles.panelDesktop]}>
              <Text style={styles.panelTitle}>Seu pedido</Text>
              <View style={styles.items}>
                {itensSelecionados.map((item) => (
                  <View key={item.produto_id} style={styles.itemRow}>
                    <View style={styles.itemDescription}>
                      <Text style={styles.itemName}>{item.quantidade}x {item.nome}</Text>
                      <Text style={styles.itemUnit}>{formatCurrency(item.preco_unitario)} cada</Text>
                    </View>
                    <Text style={styles.itemSubtotal}>
                      {formatCurrency(item.preco_unitario * item.quantidade)}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Taxa de entrega</Text>
                <Text style={styles.totalValue}>{formatCurrency(estabelecimento.taxa_entrega)}</Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>{formatCurrency(valorTotal)}</Text>
              </View>
            </View>

            <View style={[styles.panel, desktop && styles.panelDesktop]}>
              <Text style={styles.panelTitle}>Onde entregar?</Text>
              <Text style={styles.addressLabel}>Endereço de entrega</Text>
              <TextInput
                accessibilityLabel="Endereço de entrega"
                style={styles.addressInput}
                placeholder="Rua, número, complemento e bairro"
                value={enderecoEntrega}
                onChangeText={setEnderecoEntrega}
                multiline
                textAlignVertical="top"
                editable={!loading}
              />
              {erro ? <Text accessibilityRole="alert" style={styles.error}>{erro}</Text> : null}
              <TouchableOpacity style={styles.button} onPress={finalizarPedido} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Finalizar pedido · {formatCurrency(valorTotal)}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingBottom: 12 },
  orderContent: { alignSelf: 'center', maxWidth: 1050, width: '100%' },
  eyebrow: { color: '#C92A35', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  heading: { color: '#202124', fontSize: 26, fontWeight: '800', marginTop: 6 },
  establishment: { color: '#60656B', fontSize: 15, marginTop: 5 },
  checkoutLayout: { marginTop: 22 },
  checkoutLayoutDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  panel: { backgroundColor: '#FFFFFF', borderColor: '#ECEDEF', borderRadius: 16, borderWidth: 1, marginBottom: 16, padding: 20 },
  panelDesktop: { flex: 1, marginHorizontal: 8 },
  panelTitle: { color: '#202124', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  items: { paddingHorizontal: 2 },
  itemRow: { alignItems: 'center', borderBottomColor: '#ECEFF1', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13 },
  itemDescription: { flex: 1, paddingRight: 10 },
  itemName: { color: '#202124', fontSize: 14, fontWeight: '600' },
  itemUnit: { color: '#777D83', fontSize: 12, marginTop: 4 },
  itemSubtotal: { color: '#202124', fontSize: 14, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, paddingTop: 12 },
  totalLabel: { color: '#60656B', fontSize: 14 },
  totalValue: { color: '#202124', fontSize: 14 },
  grandTotal: { borderTopColor: '#DDE1E5', borderTopWidth: 1, marginTop: 12, paddingBottom: 4 },
  grandTotalLabel: { color: '#202124', fontSize: 17, fontWeight: '700' },
  grandTotalValue: { color: '#202124', fontSize: 17, fontWeight: '700' },
  addressLabel: { color: '#202124', fontSize: 15, fontWeight: '700', marginBottom: 8, marginTop: 8 },
  addressInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DDE1E5',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 120,
    padding: 13,
  },
  button: { alignItems: 'center', backgroundColor: '#E63946', borderRadius: 10, justifyContent: 'center', marginTop: 16, minHeight: 48, padding: 14 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  error: { color: '#B42318', fontSize: 13, marginTop: 10 },
  missingOrder: { alignItems: 'center', flex: 1, justifyContent: 'center', maxWidth: 520, alignSelf: 'center' },
  confirmation: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  confirmationIcon: { alignItems: 'center', backgroundColor: '#E6F4EA', borderRadius: 36, color: '#16803C', fontSize: 35, height: 72, lineHeight: 72, overflow: 'hidden', textAlign: 'center', width: 72 },
  confirmationTitle: { color: '#202124', fontSize: 25, fontWeight: '700', marginTop: 18 },
  confirmationText: { color: '#60656B', fontSize: 15, lineHeight: 22, marginTop: 10, textAlign: 'center' },
});
