import React, { useState, useEffect } from 'react'; // Dodaj useEffect
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Upewnij się, że ten adres jest poprawny (Twoja domena Hostinger)
const API_URL = 'http://srv1060782.hstgr.cloud';

// Ten ekran będzie potrzebował ID pracownika, przekażemy je z EmployeeListScreen
const SetDefaultScheduleScreen = ({ route, navigation }) => {
    // Odbierz parametry, ustawiając domyślne wartości jeśli ich nie ma
    const { employeeId, employeeName, currentStartTime, currentEndTime } = route.params || {};
    const { authToken } = useAuth();
    // Ustaw stan początkowy na podstawie przekazanych lub domyślnych wartości
    const [startTime, setStartTime] = useState(currentStartTime ? currentStartTime.substring(0, 5) : '08:00');
    const [endTime, setEndTime] = useState(currentEndTime ? currentEndTime.substring(0, 5) : '14:00');

    const handleSave = async () => {
        if (!authToken) return;
        // Prosta walidacja formatu GG:MM
        if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
             Alert.alert('Błąd', 'Nieprawidłowy format czasu. Użyj formatu GG:MM (np. 08:00).');
             return;
        }

        try {
            const response = await fetch(`${API_URL}/api/users/${employeeId}/default-schedule`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    defaultStartTime: startTime,
                    defaultEndTime: endTime
                }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sukces', `Zaktualizowano domyślny grafik dla ${employeeName}.`);
                navigation.goBack(); // Wróć do listy pracowników
            } else {
                Alert.alert('Błąd', data.error || 'Nie udało się zaktualizować grafiku.');
            }
        } catch (error) {
             console.error("Błąd sieci SetDefaultSchedule:", error);
             Alert.alert('Błąd Sieci', 'Nie można połączyć się z serwerem.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ustaw domyślny grafik dla:</Text>
            <Text style={styles.employeeName}>{employeeName || 'Brak danych'}</Text>

            <Text style={styles.label}>Domyślna godzina rozpoczęcia:</Text>
            <TextInput style={styles.input} placeholder="GG:MM" value={startTime} onChangeText={setStartTime} keyboardType="default"/>

            <Text style={styles.label}>Domyślna godzina zakończenia:</Text>
            <TextInput style={styles.input} placeholder="GG:MM" value={endTime} onChangeText={setEndTime} keyboardType="default"/>

            <Button title="Zapisz zmiany" onPress={handleSave} />
            <View style={{ marginTop: 10 }}/>
            <Button title="Anuluj" onPress={() => navigation.goBack()} color="gray"/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 20, textAlign: 'center', marginBottom: 5 },
    employeeName: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    label: { fontSize: 16, marginTop: 10, marginBottom: 5 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginBottom: 10, paddingLeft: 8 },
});

export default SetDefaultScheduleScreen;