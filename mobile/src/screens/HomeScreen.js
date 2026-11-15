import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import { restaurantImages } from '../data/menuImages';
import { request } from '../config/api';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function HomeScreen({ navigation, route }) {
  const { usuario, ultimoPedidoId } = route.params || {};
  const { width } = useWindowDimensions();
  const columns = width >= 1080 ? 3 : width >= 680 ? 2 : 1;
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    setErro('');
    request('/estabelecimentos')
      .then((data) => {
        if (ativo) setEstabelecimentos(data);
      })
      .catch((error) => {
        if (ativo) setErro(error.message);
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });
    return () => {
      ativo = false;
    };
  }, [refreshKey]);

  const estabelecimentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    if (!termo) return estabelecimentos;
    return estabelecimentos.filter((item) =>
      `${item.nome} ${item.categoria}`.toLocaleLowerCase('pt-BR').includes(termo),
    );
  }, [busca, estabelecimentos]);

  function renderEstabelecimento({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('Cardapio', {
            usuario,
            estabelecimento: item,
            estabelecimentoId: item.id,
          })
        }
        accessibilityRole="button"
        accessibilityLabel={`Abrir cardápio de ${item.nome}`}
      >
        <Image
          source={restaurantImages[item.id] || restaurantImages[1]}
          style={styles.cardImage}
          resizeMode="cover"
          accessibilityLabel={`Prato do restaurante ${item.nome}`}
        />
        <View style={styles.cardBody}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.category}>{item.categoria}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detail}>{item.tempo_estimado}</Text>
            <Text style={styles.separator}>·</Text>
            <Text style={styles.detail}>Entrega {formatCurrency(item.taxa_entrega)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>DELIVERY ADS</Text>
        <Text style={styles.greeting}>Olá, {usuario?.nome || 'encontre seu próximo pedido'}</Text>
        <Text style={styles.subtitle}>Restaurantes selecionados para você.</Text>
      </View>
      {!usuario ? (
        <View style={styles.loginBanner}>
          <Text style={styles.loginText}>Entre na sua conta para finalizar um pedido.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      {ultimoPedidoId ? (
        <Text style={styles.orderBanner}>Pedido #{ultimoPedidoId} confirmado com sucesso!</Text>
      ) : null}
      <TextInput
        accessibilityLabel="Buscar restaurante ou categoria"
        style={styles.search}
        placeholder="Buscar restaurante ou categoria"
        value={busca}
        onChangeText={setBusca}
        returnKeyType="search"
      />
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#E63946" /></View>
      ) : erro ? (
        <View style={styles.center}>
          <Text accessibilityRole="alert" style={styles.error}>{erro}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => setRefreshKey((key) => key + 1)}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key={columns}
          data={estabelecimentosFiltrados}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderEstabelecimento}
          numColumns={columns}
          contentContainerStyle={styles.list}
          columnWrapperStyle={columns > 1 ? styles.column : undefined}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum restaurante encontrado.</Text>}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: 18 },
  eyebrow: { color: '#C92A35', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  greeting: { color: '#202124', fontSize: 30, fontWeight: '800', marginTop: 6 },
  subtitle: { color: '#60656B', fontSize: 15, marginTop: 6 },
  loginBanner: {
    alignItems: 'center',
    backgroundColor: '#FFF4E5',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    padding: 14,
  },
  loginText: { color: '#684B1B', flex: 1, fontSize: 14, marginRight: 12 },
  loginLink: { color: '#A34E10', fontWeight: '700' },
  orderBanner: {
    backgroundColor: '#E6F4EA',
    borderRadius: 10,
    color: '#18743A',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
    padding: 12,
  },
  search: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E3E5',
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    marginBottom: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
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
  cardImage: { height: 190, width: '100%' },
  cardBody: { padding: 16 },
  cardTitleRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardTitle: { color: '#202124', flexShrink: 1, fontSize: 18, fontWeight: '700', marginRight: 8 },
  category: { backgroundColor: '#FCEBED', borderRadius: 20, color: '#B92D37', fontSize: 12, fontWeight: '600', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5 },
  detailsRow: { alignItems: 'center', flexDirection: 'row', marginTop: 11 },
  detail: { color: '#60656B', fontSize: 13 },
  separator: { color: '#92979C', marginHorizontal: 8 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  error: { color: '#B42318', marginBottom: 12, textAlign: 'center' },
  retryButton: { backgroundColor: '#E63946', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  retryText: { color: '#FFFFFF', fontWeight: '600' },
  empty: { color: '#60656B', paddingVertical: 24, textAlign: 'center' },
});
