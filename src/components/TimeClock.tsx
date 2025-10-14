import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

// Użyj swojego IP lub localhost dla połączenia USB
const API_URL = 'http://srv1060782.hstgr.cloud';
interface ActiveShift {
    id: number;
    clock_in_time: string;
}

const TimeClock = () => {
    const { authToken } = useAuth();
    const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);

    const fetchStatus = async () => {
        if (!authToken) return;
        try {
            const response = await fetch(`${API_URL}/api/time/status`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            if (response.ok) setActiveShift(data);
        } catch (error) { console.error(error); }
    };
    
    useFocusEffect(
        React.useCallback(() => {
            fetchStatus();
        }, [authToken])
    );

    const handleClockIn = async () => {
        if (!authToken) return;
        const response = await fetch(`${API_URL}/api/time/clock-in`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
            Alert.alert('Sukces', 'Rozpoczęto pracę.');
            fetchStatus();
        } else {
            const data = await response.json();
            Alert.alert('Błąd', data.error);
        }
    };
    
    const handleClockOut = async () => {
        if (!authToken) return;
        const response = await fetch(`${API_URL}/api/time/clock-out`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
            Alert.alert('Sukces', 'Zakończono pracę.');
            fetchStatus();
        } else {
            const data = await response.json();
            Alert.alert('Błąd', data.error);
        }
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ewidencja Czasu Pracy</Text>
            {activeShift ? (
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>Pracę rozpoczęto o:</Text>
                    <Text style={styles.timeText}>{new Date(activeShift.clock_in_time).toLocaleTimeString('pl-PL')}</Text>
                    <Button title="Zakończ pracę" onPress={handleClockOut} color="#d9534f" />
                </View>
            ) : (
                <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>Nie jesteś w pracy.</Text>
                    <Button title="Rozpocznij pracę" onPress={handleClockIn} color="#5cb85c" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 3, marginVertical: 10 },
    title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    statusContainer: { alignItems: 'center' },
    statusText: { fontSize: 16, marginBottom: 5 },
    timeText: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
});

export default TimeClock;