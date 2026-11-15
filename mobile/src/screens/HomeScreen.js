import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import ResponsiveLayout from '../components/ResponsiveLayout';
import AppButton from '../components/AppButton';
import AppInput from '../components/AppInput';
import CategoryPills from '../components/CategoryPills';
import FeedbackBanner from '../components/FeedbackBanner';
import StoreCard from '../components/StoreCard';
import useResponsive from '../hooks/useResponsive';
import { restaurantImages } from '../data/menuImages';
import { request } from '../config/api';
import { useSession } from '../auth/SessionContext';
import { colors, spacing, typography } from '../theme/tokens';

const categories = ['Todos', 'Hamburgueria', 'Pizzaria', 'Japonesa'];

export default function HomeScreen({ navigation, route }) {
  const { usuario: sessionUser } = useSession();
  const usuario = route.params?.usuario || sessionUser;
  const ultimoPedidoId = route.params?.ultimoPedidoId;
  const { isDesktop, numColumns } = useResponsive();
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    request('/estabelecimentos').then((data) => {
      if (!Array.isArray(data)) throw new Error('A resposta de estabelecimentos é inválida.');
      if (ativo) setEstabelecimentos(data);
    })
      .catch((error) => ativo && setErro(error.message))
      .finally(() => ativo && setLoading(false));
    return () => { ativo = false; };
  }, [refreshKey]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return estabelecimentos.filter((item) =>
      (categoria === 'Todos' || item.categoria === categoria) &&
      (!termo || `${item.nome} ${item.categoria}`.toLocaleLowerCase('pt-BR').includes(termo)),
    );
  }, [busca, categoria, estabelecimentos]);

  function limparFiltros() { setBusca(''); setCategoria('Todos'); }

  return (
    <ResponsiveLayout navigation={navigation} usuario={usuario}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>DESCUBRA</Text>
        <Text style={styles.title}>Olá, {usuario?.nome || 'encontre seu próximo pedido'}</Text>
        <Text style={styles.subtitle}>Entregando em: Campus ADS / Minha Região</Text>
      </View>
      {!usuario ? <FeedbackBanner message="Entre na sua conta para finalizar um pedido." variant="info" /> : null}
      {ultimoPedidoId ? <FeedbackBanner message={`Pedido #${ultimoPedidoId} confirmado e em preparo!`} variant="success" /> : null}
      <AppInput label="Buscar" value={busca} onChangeText={setBusca} placeholder="Buscar restaurante ou categoria" />
      <View style={styles.categoryWrap}>
        <CategoryPills categories={categories} selected={categoria} onSelect={setCategoria} />
      </View>
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View> : erro ? (
        <View style={styles.center}><FeedbackBanner message={erro} variant="error" /><AppButton title="Tentar novamente" onPress={() => { setErro(''); setRefreshKey((key) => key + 1); }} /></View>
      ) : (
        <FlatList
          key={numColumns}
          data={filtrados}
          keyExtractor={(item) => String(item.id)}
          numColumns={numColumns}
          renderItem={({ item }) => <StoreCard store={item} image={restaurantImages[item.id] || restaurantImages[1]} onPress={() => navigation.navigate('Cardapio', { usuario, estabelecimento: item, estabelecimentoId: item.id })} style={isDesktop && styles.desktopStoreCard} />}
          columnWrapperStyle={numColumns > 1 ? styles.column : undefined}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>Nenhum restaurante encontrado.</Text><AppButton title="Limpar filtros" variant="outline" onPress={limparFiltros} /></View>}
        />
      )}
    </ResponsiveLayout>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.md },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { ...typography.h1, marginTop: spacing.sm },
  subtitle: { ...typography.body, marginTop: spacing.xs },
  categoryWrap: { height: 52, zIndex: 2 },
  desktopStoreCard: { maxWidth: 380 },
  list: { paddingBottom: spacing.md },
  column: { gap: spacing.lg },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', padding: spacing.xl },
  emptyText: { ...typography.body, marginBottom: spacing.md },
});
