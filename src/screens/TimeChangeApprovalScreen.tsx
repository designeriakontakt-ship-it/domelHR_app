import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

// Upewnij się, że ten adres jest poprawny
const API_URL = 'http://srv1060782.hstgr.cloud';

interface TimeRequest {
  id: number;
  work_date: string;
  requested_start_time: string | null;
  requested_end_time: string | null;
  reason: string;
  full_name: string;
}

const TimeChangeApprovalScreen = () => {
    const { authToken } = useAuth(); // Usunięto nieużywany logout
    const [requests, setRequests] = useState<TimeRequest[]>([]);

    const fetchPendingRequests = async () => {
        if (!authToken) return;
        try {
            const response = await fetch(`${API_URL}/api/time-change-requests/pending`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            const data = await response.json();
            if (response.ok) {
                setRequests(data);
            } else {
                 console.error("Błąd pobierania wniosków o zmianę czasu:", data.error || response.status);
                 Alert.alert("Błąd", "Nie udało się pobrać wniosków.");
            }
        } catch (error) {
             console.error("Błąd sieci fetchPending TCR:", error);
             Alert.alert("Błąd sieci", "Nie można połączyć się z serwerem.");
        }
    };

    useFocusEffect(useCallback(() => { fetchPendingRequests(); }, [authToken]));

    const handleUpdateRequest = async (id: number, status: 'approved' | 'rejected') => {
        if (!authToken) return;
        try {
            const response = await fetch(`${API_URL}/api/time-change-requests/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ status }),
            });
            if (response.ok) {
                Alert.alert('Sukces', `Wniosek został ${status === 'approved' ? 'zaakceptowany' : 'odrzucony'}.`);
                fetchPendingRequests(); // Odśwież listę po zmianie statusu
            } else {
                const data = await response.json();
                Alert.alert('Błąd', data.error || 'Nie udało się zaktualizować wniosku.');
            }
        } catch (error) {
             console.error("Błąd sieci handleUpdateRequest TCR:", error);
             Alert.alert("Błąd sieci", "Nie można połączyć się z serwerem.");
        }
    };

    const renderRequest = ({ item }: { item: TimeRequest }) => (
        <View style={styles.requestItem}>
            <Text style={styles.employeeName}>{item.full_name} - {new Date(item.work_date).toLocaleDateString('pl-PL')}</Text>
            {item.requested_start_time && <Text>Proponowany start: {item.requested_start_time.substring(0, 5)}</Text>}
            {item.requested_end_time && <Text>Proponowany koniec: {item.requested_end_time.substring(0, 5)}</Text>}
            {item.reason && <Text>Powód: {item.reason}</Text>}
            <View style={styles.buttonContainer}>
                <Button title="Akceptuj" onPress={() => handleUpdateRequest(item.id, 'approved')} color="green" />
                <Button title="Odrzuć" onPress={() => handleUpdateRequest(item.id, 'rejected')} color="red" />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={requests}
                renderItem={renderRequest}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.emptyText}>Brak oczekujących wniosków.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    requestItem: { padding: 15, borderRadius: 8, marginBottom: 10, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd' },
    employeeName: { fontSize: 16, fontWeight: 'bold' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
    emptyText: { textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
});

export default TimeChangeApprovalScreen;