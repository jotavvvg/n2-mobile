import { SafeAreaView, StyleSheet, useWindowDimensions, View } from 'react-native';

export default function ScreenContainer({ children }) {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.content, { paddingHorizontal: width >= 900 ? 32 : 16 }]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 24,
  },
});
