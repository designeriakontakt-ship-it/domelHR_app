import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, Button } from 'react-native'; // Dodano Button
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

// Upewnij się, że ten adres jest poprawny
const API_URL = 'http://srv1060782.hstgr.cloud';

interface Employee {
  id: number;
  full_name: string;
  email: string;
  default_start_time: string | null;
  default_end_time: string | null;
  vacation_days_entitlement: number | null; // Dodano wymiar urlopu
}

const EmployeeListScreen = ({ navigation }) => {
    const { authToken } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmployees = async () => {
        if (!authToken) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/employees`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            // Dodajmy logowanie odpowiedzi, żeby zobaczyć co dostajemy
            // console.log("Odpowiedź /api/employees status:", response.status);
            const data = await response.json();
            // console.log("Dane pracowników:", JSON.stringify(data, null, 2));

            if (response.ok) {
                setEmployees(data);
            } else {
                Alert.alert('Błąd', 'Nie udało się pobrać listy pracowników.');
                console.error("Błąd pobierania pracowników:", data.error || response.status);
            }
        } catch (error) {
             Alert.alert('Błąd Sieci', 'Nie można połączyć się z serwerem.');
             console.error("Błąd sieci fetchEmployees:", error);
        }
        finally { setLoading(false); }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEmployees();
        }, [authToken])
    );

    const renderItem = ({ item }: { item: Employee }) => (
        // Używamy View jako kontenera
        <View style={styles.itemContainer}>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <Text style={styles.scheduleInfo}>
                Grafik: {item.default_start_time ? item.default_start_time.substring(0,5) : 'Brak'} - {item.default_end_time ? item.default_end_time.substring(0,5) : 'Brak'}
            </Text>
            {/* Dodajemy wiersz z przyciskami */}
            <View style={styles.buttonRow}>
                 <Button title="Ustaw Grafik" onPress={() => navigation.navigate('SetDefaultSchedule', {
                      employeeId: item.id,
                      employeeName: item.full_name,
                      currentStartTime: item.default_start_time,
                      currentEndTime: item.default_end_time
                 })} />
                 <Button title="Ustaw Urlop" onPress={() => navigation.navigate('SetVacation', {
                      employeeId: item.id,
                      employeeName: item.full_name,
                      currentEntitlement: item.vacation_days_entitlement // Przekazujemy obecny wymiar
                 })} />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={employees}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={<Text style={styles.emptyText}>Brak pracowników w systemie.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    itemContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 5, // Dodano mały margines dolny
    },
    name: { fontSize: 16, fontWeight: 'bold' },
    email: { fontSize: 14, color: 'gray' },
    scheduleInfo: { fontSize: 13, color: 'darkblue', marginTop: 3 },
    buttonRow: { // Nowy styl dla wiersza przycisków
        flexDirection: 'row',
        justifyContent: 'space-around', // Rozłożenie przycisków
        marginTop: 10,
    },
    emptyText: { textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
});

export default EmployeeListScreen;