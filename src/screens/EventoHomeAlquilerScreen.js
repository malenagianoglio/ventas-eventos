import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';   

export default function EventoHomeAlquiladoScreen({ route }) {
  const navigation = useNavigation();
  const { eventId } = route.params; 

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Panel de Alquiler</Text>
            <Pressable style={styles.button} onPress={() => navigation.navigate('Ventas', { eventId })}>
                <MaterialIcons style={styles.icon} name="point-of-sale" size={40} color="white" />
                <Text style={styles.text}>Ventas</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        width: '90%',
        paddingVertical: 20,
        borderRadius: 12,
        backgroundColor: '#111',
        marginBottom: 20,
        alignItems: 'center',
    },  
    icon: {
        marginBottom: 10,
        color: '#fff',
    },
    text: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});