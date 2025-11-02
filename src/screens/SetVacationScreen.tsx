import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://srv1060782.hstgr.cloud';

const SetVacationScreen = ({ route, navigation }) => {
    const { employeeId, employeeName, currentEntitlement } = route.params;
    const { authToken } = useAuth();
    // Ustaw stan początkowy na obecną wartość lub 20
    const [days, setDays] = useState(currentEntitlement?.toString() || '20');

    const handleSave = async () => {
        if (!authToken) return;
        try {
            const response = await fetch(`${API_URL}/api/users/${employeeId}/vacation-entitlement`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ vacationDays: days }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sukces', `Zaktualizowano wymiar urlopu dla ${employeeName}.`);
                navigation.goBack();
            } else {
                Alert.alert('Błąd', data.error || 'Nie udało się zaktualizować danych.');
            }
        } catch (error) { Alert.alert('Błąd Sieci', 'Nie można połączyć się z serwerem.'); }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ustaw wymiar urlopu dla:</Text>
            <Text style={styles.employeeName}>{employeeName}</Text>
            <TextInput
                style={styles.input}
                value={days}
                onChangeText={setDays}
                keyboardType="numeric"
                placeholderTextColor="#888"
            />
            <Button title="Zapisz wymiar urlopu" onPress={handleSave} />
            <View style={{ marginTop: 10 }}/>
            <Button title="Anuluj" onPress={() => navigation.goBack()} color="gray"/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 20, textAlign: 'center', marginBottom: 5 },
    employeeName: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginBottom: 10, paddingLeft: 8, textAlign: 'center', fontSize: 18 },
});

export default SetVacationScreen;