import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { getEvents, initDB } from '../../database';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

export default function VerEventosScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const renderItem = ({ item }) => (
    <Pressable 
      style={styles.card}
      onPress={() => item.type === 'alquilado' ? navigation.navigate('EventoHomeAlquilado', { eventId: item.id }) : navigation.navigate('EventoHome', { eventId: item.id })}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons 
          name="event" 
          size={40} 
          color="#fff" 
        />
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        
        <View style={styles.row}>
          <View style={[styles.badge, item.type === 'propio' ? styles.badgePropio : styles.badgeAlquilado]}>
            <MaterialIcons 
              name={item.type === 'propio' ? 'home' : 'storefront'} 
              size={14} 
              color="#fff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.badgeText}>
              {item.type === 'propio' ? 'Propio' : 'Alquilado'}
            </Text>
            <Text style={[styles.badgeText, styles.badgeTextMarginLeft]}>
              {item.access_code ? `${item.access_code}` : ''}
            </Text>
          </View>
          
          {item.date && (
            <View style={styles.dateContainer}>
              <MaterialIcons 
                name="calendar-today" 
                size={14} 
                color="#666"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.date}>{item.date}</Text>
            </View>
          )}
        </View>
      </View>

      <MaterialIcons 
        name="chevron-right" 
        size={28} 
        color="#222"
      />
    </Pressable>
  );

  if (!loading && events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons 
          name="event-note" 
          size={64} 
          color="#ccc"
          style={{ marginBottom: 20 }}
        />
        <Text style={styles.emptyTitle}>No hay eventos</Text>
        <Text style={styles.emptyText}>
          Todavía no se creó ningún evento
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eventos</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
    paddingRight: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#222',
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
    marginBottom: 8,
    color: '#111',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgePropio: {
    backgroundColor: '#222',
  },
  badgeAlquilado: {
    backgroundColor: '#666',
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  date: {
    fontSize: 13,
    color: '#666',
  },
  button: {
    backgroundColor: '#222',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  badgeTextMarginLeft: {
    marginLeft: 4,
  },
});
