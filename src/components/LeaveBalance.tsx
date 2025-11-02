import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native'; // Dodaj useFocusEffect

const API_URL = 'http://srv1060782.hstgr.cloud';

interface Balance {
    entitlement: number;
    used: number;
    remaining: number;
}

const LeaveBalance = () => {
    const { authToken } = useAuth();
    const [balance, setBalance] = useState<Balance | null>(null);

    const fetchBalance = async () => {
        if (!authToken) return;
        try {
            const response = await fetch(`${API_URL}/api/leave-balance`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            const data = await response.json();
            if (response.ok) {
                setBalance(data);
            } else {
                console.error("Błąd pobierania salda:", data.error || response.status);
                // Ustawiamy błąd, aby użytkownik wiedział, że coś poszło nie tak
                setBalance({ entitlement: 0, used: 0, remaining: 0 }); // Lub inny stan błędu
                // Można też dodać Alert.alert(...)
            }
        } catch (error) {
             console.error("Błąd sieci fetchBalance:", error);
             setBalance({ entitlement: 0, used: 0, remaining: 0 }); // Stan błędu
             // Można też dodać Alert.alert(...)
        }
    };

    // Użyj useFocusEffect, aby odświeżać saldo po powrocie na ekran
    useFocusEffect(
        React.useCallback(() => {
            fetchBalance();
        }, [authToken])
    );

    // Sprawdzenie stanu ładowania - upewnij się, że zwracasz <Text>
    if (balance === null) {
        return <Text style={styles.loadingText}>Ładowanie salda urlopowego...</Text>;
    }

    // Jeśli wystąpił błąd (np. balance ustawiony na {entitlement:0,...} po błędzie)
    // Możesz tu dodać inną logikę wyświetlania błędu

    return (
        <View style={styles.container}>
    <Text style={styles.title}>Dostępny urlop</Text>
    {/* Połączono tekst "Pozostało:", saldo i "dni" w jeden komponent Text */}
    <Text style={styles.balanceText}>
        Pozostało: <Text style={styles.remainingDays}>{balance.remaining}</Text> / {balance.entitlement} dni
    </Text>
    {/* Tekst o wykorzystanych dniach jest już poprawnie w komponencie Text */}
    <Text style={styles.usedText}>(Wykorzystano: {balance.used})</Text>
</View>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#eef5ff', padding: 15, borderRadius: 8, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#bddcff' },
    title: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    balanceText: { fontSize: 14, color: '#555' },
    remainingDays: { fontSize: 18, fontWeight: 'bold', color: '#0056b3' },
    usedText: { fontSize: 12, color: 'gray', marginTop: 3 },
    loadingText: { fontStyle: 'italic', color: 'gray', textAlign: 'center', marginVertical: 10 }
});

export default LeaveBalance;