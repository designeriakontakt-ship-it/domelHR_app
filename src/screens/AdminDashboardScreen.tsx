// src/screens/AdminDashboardScreen.tsx (kompletna wersja)
import  React, { useState, useCallback } from 'react';
import { View, Button, StyleSheet, Text, FlatList, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

 import { API_URL } from '../config/api';// Pamiętaj, aby używać swojego IP

interface PendingRequest {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  full_name: string;
}

const AdminDashboardScreen = ({ navigation }) => {
    const { logout, authToken } = useAuth();
    const [requests, setRequests] = useState<PendingRequest[]>([]);

    const fetchPendingRequests = async () => {
        if (!authToken) return;
        try {
            const response = await fetch(`${API_URL}/api/leave-requests/pending`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            const data = await response.json();
            if (response.ok) setRequests(data);
        } catch (error) { console.error(error); }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPendingRequests();
        }, [authToken])
    );

    const handleUpdateRequest = async (id: number, status: 'approved' | 'rejected') => {
        if (!authToken) return;
        try {
            const response = await fetch(`${API_URL}/api/leave-requests/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ status }),
            });
            if (response.ok) {
                Alert.alert('Sukces', `Wniosek został ${status === 'approved' ? 'zaakceptowany' : 'odrzucony'}.`);
                fetchPendingRequests();
            } else {
                const data = await response.json();
                Alert.alert('Błąd', data.error);
            }
        } catch (error) { console.error(error); }
    };

    const renderRequest = ({ item }: { item: PendingRequest }) => (
        <View style={styles.requestItem}>
            <Text style={styles.employeeName}>{item.full_name}</Text>
            <Text>Od: {new Date(item.start_date).toLocaleDateString()}</Text>
            <Text>Do: {new Date(item.end_date).toLocaleDateString()}</Text>
            {item.reason && <Text>Powód: {item.reason}</Text>}
            <View style={styles.buttonContainer}>
                <Button title="Akceptuj" onPress={() => handleUpdateRequest(item.id, 'approved')} color="green" />
                <Button title="Odrzuć" onPress={() => handleUpdateRequest(item.id, 'rejected')} color="red" />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Button title="Zarządzaj Pracownikami" onPress={() => navigation.navigate('EmployeeList')} />
            <View style={{ marginVertical: 10 }} />
            <Button title="Stwórz Grafik" onPress={() => navigation.navigate('ScheduleCreator')} />

            <Text style={styles.title}>Wnioski do rozpatrzenia</Text>
            {/* ... (reszta z FlatList bez zmian) */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', marginVertical: 16, textAlign: 'center' },
    requestItem: { padding: 15, borderRadius: 8, marginBottom: 10, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd' },
    employeeName: { fontSize: 16, fontWeight: 'bold' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
    emptyText: { textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
});

export default AdminDashboardScreen;