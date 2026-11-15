import { getPathFromState } from '@react-navigation/native';
import * as ExpoLinking from 'expo-linking';

function stripEphemeralParams(state) {
  return {
    ...state,
    routes: state.routes.map((route) => {
      const establishmentId =
        route.params?.estabelecimentoId ?? route.params?.estabelecimento?.id;

      return {
        ...route,
        params:
          route.name === 'Cardapio' && establishmentId
            ? { estabelecimentoId: establishmentId }
            : undefined,
        state: route.state ? stripEphemeralParams(route.state) : undefined,
      };
    }),
  };
}

export const linking = {
  prefixes: [ExpoLinking.createURL('/'), 'deliveryads://'],
  config: {
    initialRouteName: 'Login',
    screens: {
      Login: 'entrar',
      Cadastro: 'cadastro',
      Home: 'restaurantes',
      Cardapio: {
        path: 'restaurantes/:estabelecimentoId/cardapio',
        parse: { estabelecimentoId: Number },
      },
      Pedido: 'pedido',
    },
  },
  getPathFromState(state, options) {
    return getPathFromState(stripEphemeralParams(state), options);
  },
};
