import React from 'react';
import { ScrollView, View, StyleSheet, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';
import TimeClock from '../components/TimeClock';

const HomeScreen = ({ navigation }) => {
    const { logout } = useAuth();
    
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TimeClock />
            
            <View style={styles.separator} />
            
            <Button 
                title="Wnioski Urlopowe" 
                onPress={() => navigation.navigate('LeaveRequests')}
            />
            
            <View style={styles.separator} />
            
            {/* Ten przycisk na razie nic nie robi, bo nie mamy ekranu 'PaylipScreen' w nawigacji */}
            <Button title="Paski Wynagrodzeń" onPress={() => alert('Funkcja w budowie!')} />

            <View style={styles.separator} />

            <Button title="Wyloguj się" onPress={logout} color="red" />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flexGrow: 1, 
        justifyContent: 'center', 
        padding: 16 
    },
    separator: { 
        marginVertical: 10 
    },
});

// TO JEST KLUCZOWY ELEMENT, KTÓREGO NAJPRAWDOPODOBNIEJ BRAKOWAŁO
export default HomeScreen;