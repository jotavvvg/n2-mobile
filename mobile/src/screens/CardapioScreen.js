import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import ResponsiveLayout from '../components/ResponsiveLayout';
import CartSidebar from '../components/CartSidebar';
import CartSummaryBar from '../components/CartSummaryBar';
import FeedbackBanner from '../components/FeedbackBanner';
import ProductCard from '../components/ProductCard';
import useResponsive from '../hooks/useResponsive';
import { getProductImage } from '../data/menuImages';
import { request } from '../config/api';
import { useSession } from '../auth/SessionContext';
import { colors, spacing, typography } from '../theme/tokens';

export default function CardapioScreen({ navigation, route }) {
  const params = route.params || {};
  const { usuario: sessionUser } = useSession();
  const usuario = params.usuario || sessionUser;
  const estabelecimentoInicial = params.estabelecimento;
  const estabelecimentoId = Number(params.estabelecimentoId || estabelecimentoInicial?.id);
  const { isDesktop, productColumns } = useResponsive();
  const [estabelecimento, setEstabelecimento] = useState(estabelecimentoInicial || null);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        if (!Number.isInteger(estabelecimentoId) || estabelecimentoId < 1) throw new Error('O endereço não identifica um restaurante válido.');
        let restaurante = estabelecimentoInicial;
        if (!restaurante) restaurante = (await request('/estabelecimentos')).find((item) => item.id === estabelecimentoId);
        if (!restaurante) throw new Error('Restaurante não encontrado.');
        const data = await request(`/estabelecimentos/${estabelecimentoId}/produtos`);
        if (!Array.isArray(data)) throw new Error('A resposta do cardápio é inválida.');
        if (ativo) { setEstabelecimento(restaurante); setProdutos(data); }
      } catch (error) { if (ativo) setErro(error.message); } finally { if (ativo) setLoading(false); }
    }
    carregar();
    return () => { ativo = false; };
  }, [estabelecimentoId, estabelecimentoInicial]);

  const quantidadeTotal = useMemo(() => carrinho.reduce((total, item) => total + item.quantidade, 0), [carrinho]);
  const subtotal = useMemo(() => carrinho.reduce((total, item) => total + item.preco_unitario * item.quantidade, 0), [carrinho]);

  function adicionar(produto) {
    setCarrinho((atual) => {
      const existente = atual.find((item) => item.produto_id === produto.id);
      if (existente) return atual.map((item) => item.produto_id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item);
      return [...atual, { produto_id: produto.id, nome: produto.nome, preco_unitario: Number(produto.preco), quantidade: 1 }];
    });
  }
  function alterarQuantidade(produtoId, delta) {
    setCarrinho((atual) => atual.map((item) => item.produto_id === produtoId ? { ...item, quantidade: item.quantidade + delta } : item).filter((item) => item.quantidade > 0));
  }
  function revisarPedido() {
    if (!usuario) { navigation.navigate('Login'); return; }
    if (!carrinho.length) { setErro('Adicione ao menos um produto para continuar.'); return; }
    navigation.navigate('Pedido', { usuario, estabelecimento, itensSelecionados: carrinho });
  }

  return (
    <ResponsiveLayout navigation={navigation} usuario={usuario} onBack={() => navigation.goBack()}>
      <View style={styles.banner}>
        <Text style={styles.eyebrow}>CARDÁPIO</Text>
        <Text style={styles.title}>{estabelecimento?.nome || 'Restaurante'}</Text>
        <Text style={styles.subtitle}>{estabelecimento ? `${estabelecimento.categoria} · ${estabelecimento.tempo_estimado} · ${Number(estabelecimento.taxa_entrega) === 0 ? 'Entrega Grátis' : `Entrega R$ ${Number(estabelecimento.taxa_entrega).toFixed(2).replace('.', ',')}`}` : 'Escolha seus pratos favoritos.'}</Text>
      </View>
      <FeedbackBanner message={erro} variant="error" />
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View> : (
        <View style={[styles.layout, isDesktop && styles.desktopLayout]}>
          <FlatList
            style={styles.productList}
            key={productColumns}
            data={produtos}
            keyExtractor={(item) => String(item.id)}
            numColumns={productColumns}
            renderItem={({ item }) => {
              const selected = carrinho.find((product) => product.produto_id === item.id);
              return <ProductCard product={item} image={getProductImage(item.id, estabelecimentoId)} quantity={selected?.quantidade || 0} onAdd={() => adicionar(item)} onQuantityChange={(delta) => alterarQuantidade(item.id, delta)} />;
            }}
            columnWrapperStyle={productColumns > 1 ? styles.productColumns : undefined}
            contentContainerStyle={styles.products}
            ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado.</Text>}
          />
          {isDesktop ? <View style={styles.sidebar}><CartSidebar items={carrinho} deliveryFee={estabelecimento?.taxa_entrega} onPress={revisarPedido} /></View> : null}
        </View>
      )}
      {!isDesktop ? <CartSummaryBar quantity={quantidadeTotal} subtotal={subtotal} onPress={revisarPedido} /> : null}
    </ResponsiveLayout>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.surface, borderRadius: 16, marginBottom: spacing.lg, padding: spacing.lg },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { ...typography.h1, marginTop: spacing.sm },
  subtitle: { ...typography.body, marginTop: spacing.xs },
  layout: { flex: 1 },
  desktopLayout: { flexDirection: 'row', gap: spacing.lg },
  products: { paddingBottom: 100 },
  productList: { flex: 1 },
  productColumns: { gap: spacing.md },
  sidebar: { width: 340 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  empty: { ...typography.body, padding: spacing.xl, textAlign: 'center' },
});
