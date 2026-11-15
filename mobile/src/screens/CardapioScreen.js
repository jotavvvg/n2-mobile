import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { getProductImage } from '../data/menuImages';
import { request } from '../config/api';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CardapioScreen({ navigation, route }) {
  const routeParams = route.params || {};
  const usuario = routeParams.usuario;
  const estabelecimentoInicial = routeParams.estabelecimento;
  const estabelecimentoId = Number(routeParams.estabelecimentoId || estabelecimentoInicial?.id);
  const { width } = useWindowDimensions();
  const columns = width >= 980 ? 2 : 1;
  const [estabelecimento, setEstabelecimento] = useState(estabelecimentoInicial || null);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    async function carregarCardapio() {
      setLoading(true);
      setErro('');

      try {
        if (!Number.isInteger(estabelecimentoId) || estabelecimentoId < 1) {
          throw new Error('O endereço não identifica um restaurante válido.');
        }

        let restaurante = estabelecimentoInicial;
        if (!restaurante) {
          const estabelecimentos = await request('/estabelecimentos');
          restaurante = estabelecimentos.find((item) => item.id === estabelecimentoId);
        }
        if (!restaurante) {
          throw new Error('Restaurante não encontrado.');
        }

        const data = await request(`/estabelecimentos/${estabelecimentoId}/produtos`);
        if (ativo) {
          setEstabelecimento(restaurante);
          setProdutos(data);
        }
      } catch (error) {
        if (ativo) setErro(error.message);
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregarCardapio();
    return () => {
      ativo = false;
    };
  }, [estabelecimentoId, estabelecimentoInicial]);

  const quantidadeTotal = useMemo(
    () => carrinho.reduce((total, item) => total + item.quantidade, 0),
    [carrinho],
  );
  const subtotal = useMemo(
    () => carrinho.reduce((total, item) => total + item.preco_unitario * item.quantidade, 0),
    [carrinho],
  );

  function adicionar(produto) {
    setErro('');
    setCarrinho((atual) => {
      const existente = atual.find((item) => item.produto_id === produto.id);
      if (existente) {
        return atual.map((item) =>
          item.produto_id === produto.id ? { ...item, quantidade: item.quantidade + 1 } : item,
        );
      }
      return [
        ...atual,
        {
          produto_id: produto.id,
          nome: produto.nome,
          preco_unitario: Number(produto.preco),
          quantidade: 1,
        },
      ];
    });
  }

  function alterarQuantidade(produtoId, delta) {
    setCarrinho((atual) =>
      atual
        .map((item) =>
          item.produto_id === produtoId ? { ...item, quantidade: item.quantidade + delta } : item,
        )
        .filter((item) => item.quantidade > 0),
    );
  }

  function revisarPedido() {
    if (!usuario) {
      navigation.navigate('Login');
      return;
    }
    if (carrinho.length === 0) {
      setErro('Adicione ao menos um produto para continuar.');
      return;
    }
    navigation.navigate('Pedido', { usuario, estabelecimento, itensSelecionados: carrinho });
  }

  function renderProduto({ item }) {
    const selecionado = carrinho.find((produto) => produto.produto_id === item.id);
    return (
      <View style={styles.card}>
        <Image
          source={getProductImage(item.id, estabelecimentoId)}
          style={styles.productImage}
          resizeMode="cover"
          accessibilityLabel={`Foto de ${item.nome}`}
        />
        <View style={styles.cardBody}>
          <Text style={styles.productName}>{item.nome}</Text>
          {item.descricao ? <Text style={styles.description}>{item.descricao}</Text> : null}
          <View style={styles.productFooter}>
            <Text style={styles.price}>{formatCurrency(item.preco)}</Text>
            {selecionado ? (
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  accessibilityLabel={`Remover uma unidade de ${item.nome}`}
                  style={styles.quantityButton}
                  onPress={() => alterarQuantidade(item.id, -1)}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{selecionado.quantidade}</Text>
                <TouchableOpacity
                  accessibilityLabel={`Adicionar uma unidade de ${item.nome}`}
                  style={styles.quantityButton}
                  onPress={() => adicionar(item)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={() => adicionar(item)}>
                <Text style={styles.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>CARDÁPIO</Text>
        <Text style={styles.title}>{estabelecimento?.nome || 'Restaurante'}</Text>
        <Text style={styles.subtitle}>
          {estabelecimento
            ? `${estabelecimento.categoria} · ${estabelecimento.tempo_estimado}`
            : 'Escolha seus pratos favoritos.'}
        </Text>
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#E63946" /></View>
      ) : erro && produtos.length === 0 ? (
        <View style={styles.center}>
          <Text accessibilityRole="alert" style={styles.error}>{erro}</Text>
        </View>
      ) : (
        <FlatList
          key={columns}
          data={produtos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProduto}
          numColumns={columns}
          contentContainerStyle={styles.list}
          columnWrapperStyle={columns > 1 ? styles.column : undefined}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado.</Text>}
        />
      )}
      {erro && produtos.length > 0 ? (
        <Text accessibilityRole="alert" style={styles.inlineError}>{erro}</Text>
      ) : null}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerCount}>
            {quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'}
          </Text>
          <Text style={styles.footerTotal}>Subtotal {formatCurrency(subtotal)}</Text>
        </View>
        <TouchableOpacity style={styles.reviewButton} onPress={revisarPedido}>
          <Text style={styles.reviewButtonText}>
            {usuario ? 'Revisar pedido' : 'Entrar para pedir'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: 18 },
  eyebrow: { color: '#C92A35', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: '#202124', fontSize: 28, fontWeight: '800', marginTop: 6 },
  subtitle: { color: '#60656B', fontSize: 15, marginTop: 5 },
  list: { paddingBottom: 12 },
  column: { marginHorizontal: -8 },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ECEDEF',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  productImage: { height: 190, width: '100%' },
  cardBody: { flex: 1, padding: 16 },
  productName: { color: '#202124', fontSize: 17, fontWeight: '700' },
  description: { color: '#60656B', fontSize: 13, lineHeight: 19, marginTop: 7 },
  productFooter: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  price: { color: '#202124', fontSize: 16, fontWeight: '800' },
  addButton: { backgroundColor: '#FCEBED', borderRadius: 9, paddingHorizontal: 15, paddingVertical: 10 },
  addButtonText: { color: '#B92D37', fontSize: 13, fontWeight: '700' },
  quantityControl: { alignItems: 'center', flexDirection: 'row' },
  quantityButton: { alignItems: 'center', backgroundColor: '#FCEBED', borderRadius: 8, height: 34, justifyContent: 'center', width: 34 },
  quantityButtonText: { color: '#B92D37', fontSize: 20, fontWeight: '700' },
  quantity: { color: '#202124', fontSize: 15, fontWeight: '700', minWidth: 34, textAlign: 'center' },
  footer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#ECEDEF',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
    padding: 14,
  },
  footerCount: { color: '#202124', fontSize: 14, fontWeight: '700' },
  footerTotal: { color: '#60656B', fontSize: 12, marginTop: 4 },
  reviewButton: { backgroundColor: '#E63946', borderRadius: 9, paddingHorizontal: 17, paddingVertical: 13 },
  reviewButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  error: { color: '#B42318', marginTop: 18, textAlign: 'center' },
  inlineError: { color: '#B42318', fontSize: 12, marginBottom: 8 },
  empty: { color: '#60656B', paddingVertical: 24, textAlign: 'center' },
});
