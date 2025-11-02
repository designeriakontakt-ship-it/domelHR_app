import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Upewnij się, że adres jest poprawny
const API_URL = 'http://srv1060782.hstgr.cloud';

const TimeChangeRequestScreen = ({ route, navigation }) => {
    // Sprawdź, czy route.params istnieje i ma workDate
    const workDate = route.params?.workDate;
    const { authToken } = useAuth();
    const [startTime, setStartTime] = useState(''); // Format HH:MM
    const [endTime, setEndTime] = useState('');   // Format HH:MM
    const [reason, setReason] = useState('');

    // Sprawdź, czy workDate zostało przekazane
    if (!workDate) {
        // Obsługa błędu - np. powrót lub wyświetlenie komunikatu
        Alert.alert("Błąd", "Nie przekazano daty do wniosku.");
        navigation.goBack();
        return null; // Zwróć null, aby nic nie renderować
    }

    const handleSubmit = async () => {
        if (!authToken) return;
        if (!startTime && !endTime) {
            Alert.alert('Błąd', 'Podaj przynajmniej godzinę rozpoczęcia lub zakończenia.');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/time-change-requests`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    workDate: workDate,
                    requestedStartTime: startTime || null,
                    requestedEndTime: endTime || null,
                    reason: reason
                }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sukces', 'Wniosek o zmianę czasu został złożony.');
                navigation.goBack();
            } else {
                Alert.alert('Błąd', data.error || 'Nie udało się złożyć wniosku.');
            }
        } catch (error) {
             console.error("Błąd sieci handleSubmit TCR:", error);
             Alert.alert('Błąd Sieci', 'Nie można połączyć się z serwerem.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Wniosek o zmianę czasu pracy</Text>
            <Text style={styles.dateLabel}>Data: {new Date(workDate).toLocaleDateString('pl-PL')}</Text>

            <Text style={styles.label}>Godzina rozpoczęcia (zostaw puste, jeśli bez zmian):</Text>
            <TextInput style={styles.input} placeholder="GG:MM" value={startTime} onChangeText={setStartTime} keyboardType="defualt"/>

            <Text style={styles.label}>Godzina zakończenia (zostaw puste, jeśli bez zmian):</Text>
            <TextInput style={styles.input} placeholder="GG:MM" value={endTime} onChangeText={setEndTime} keyboardType="defualt"/>

            <Text style={styles.label}>Powód zmiany:</Text>
            <TextInput
                style={[styles.input, styles.reasonInput]}
                placeholder="Np. wcześniejsze wyjście, nadgodziny"
                value={reason}
                onChangeText={setReason}
                multiline
                placeholderTextColor="#888" // Dodano placeholderTextColor
            />

            <Button title="Wyślij wniosek" onPress={handleSubmit} />
            <View style={{ marginTop: 10 }}/>
            <Button title="Anuluj" onPress={() => navigation.goBack()} color="gray"/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    dateLabel: { fontSize: 18, textAlign: 'center', marginBottom: 20, color: 'gray' },
    label: { fontSize: 16, marginTop: 10, marginBottom: 5 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginBottom: 10, paddingLeft: 8 },
    reasonInput: { height: 80, textAlignVertical: 'top', paddingTop: 8 },
});

export default TimeChangeRequestScreen;