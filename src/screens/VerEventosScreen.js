import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Pressable, TextInput } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { getEvents, initDB } from '../../database';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

export default function VerEventosScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const IconoCalendario = () => (
    <Svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
      <Path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Z"/>
    </Svg>
  );

  const loadEvents = async () => {
    try {
      await initDB();
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [])
  );

  const navigateToEvento = (item) => {
    const screen = item.type === 'alquilado' ? 'EventoHomeAlquilado' : 'EventoHome';
    navigation.navigate(screen, { eventId: item.id });
  };

  const renderItem = ({ item }) => (
    <Pressable style={styles.card} onPress={() => navigateToEvento(item)}>
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
              <TextInput
                style={[styles.badgeText, { marginLeft: 4 }]}
                editable={false}
                value={item.access_code}
              />
            ) : null}
          </View>

          {item.date ? (
            <View style={styles.dateContainer}>
              <TextInput style={styles.date} editable={false} value={item.date} />
            </View>
          ) : null}
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigateToEvento(item)}>
        <TextInput style={styles.buttonText} editable={false} value="Ver" />
      </TouchableOpacity>
    </Pressable>
  );

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
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 25,
    marginBottom: 15,
    textAlign: 'center',
    color: '#2D3436',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#54A0FF',
    marginBottom: 15,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#0F3460',
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
    color: '#2D3436',
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
  },
  badgePropio: {
    backgroundColor: '#222',
  },
  badgeAlquilado: {
    backgroundColor: '#666',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    padding: 0,
    margin: 0,
    height: 20,
  },
  dateContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  date: {
    fontSize: 13,
    color: '#666',
    padding: 0,
    margin: 0,
    height: 20,
  },
  button: {
    backgroundColor: '#0F3460',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    marginBottom: 10,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});