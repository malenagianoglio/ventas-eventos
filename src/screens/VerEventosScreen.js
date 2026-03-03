import { View, StyleSheet, FlatList, Alert, Pressable, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { useEventos } from '../hooks/useEventos';
import { IconoCalendario } from '../components/Icons';
import LoadingScreen from '../components/LoadingScreen';

export default function VerEventosScreen({ navigation }) {
  const { events, loading } = useEventos();
  
  const renderItem = ({ item }) => (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('EventoHome', { eventId: item.id })}
    >
      <View style={styles.iconContainer}>
        <IconoCalendario />
      </View>

      <View style={styles.info}>
        <TextInput style={styles.name} editable={false} value={item.name} />
        <View style={styles.row}>
          <View style={[styles.badge, item.type === 'propio' ? styles.badgePropio : styles.badgeAlquilado]}>
            <TextInput
              style={styles.badgeText}
              editable={false}
              value={item.type === 'propio' ? 'Propio' : 'Alquilado'}
            />
            {item.access_code ? (
              <TextInput style={styles.badgeCode} editable={false} value={item.access_code} />
            ) : null}
          </View>
          {item.date ? (
            <View style={styles.dateContainer}>
              <TextInput style={styles.date} editable={false} value={item.date} />
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );

  if (loading) return <LoadingScreen />;

  if (!loading && events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <TextInput style={styles.emptyTitle} editable={false} value="No hay eventos" />
        <TextInput style={styles.emptyText} editable={false} value="Aún no se creó ningún evento" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.title} editable={false} value="Eventos" />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    marginBottom: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 15,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    height: 26,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRadius: 6,
    height: 28,
    gap: 4,
  },
  badgePropio: {
    backgroundColor: colors.button,
  },
  badgeAlquilado: {
    backgroundColor: colors.secondary,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
    padding: 0,
    margin: 0,
    height: 20,
  },
  badgeCode: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    padding: 0,
    margin: 0,
    height: 20,
  },
  dateContainer: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  date: {
    fontSize: 13,
    color: colors.textMuted,
    padding: 0,
    margin: 0,
    height: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
});