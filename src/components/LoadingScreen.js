import { View, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { colors } from '../theme/colors';

export default function LoadingScreen({ mensaje = 'Cargando...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <TextInput style={styles.texto} editable={false} value={mensaje} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  texto: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
    padding: 0,
    margin: 0,
  },
});