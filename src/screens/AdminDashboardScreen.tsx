import React, { useState, useCallback } from 'react';
import { View, Button, StyleSheet, Text, FlatList, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

// Upewnij się, że ten adres jest poprawny
const API_URL = 'http://srv1060782.hstgr.cloud';

interface PendingLeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  reason: string;
  full_name: string;
}

interface PendingTimeRequest {
  id: number;
  work_date: string;
  requested_start_time: string | null;
  requested_end_time: string | null;
  reason: string;
  full_name: string;
}

const AdminDashboardScreen = ({ navigation }) => {
    const { logout, authToken } = useAuth();
    const [leaveRequests, setLeaveRequests] = useState<PendingLeaveRequest[]>([]);
    const [timeRequests, setTimeRequests] = useState<PendingTimeRequest[]>([]);
    const [loading, setLoading] = useState(true); // Ustaw ładowanie na true na początku

    const fetchData = async () => {
        if (!authToken) return;
        setLoading(true); // Ustaw ładowanie przed pobraniem
        console.log('AdminDashboard: Rozpoczynam pobieranie danych...');
        try {
            const [leaveRes, timeRes] = await Promise.all([
                fetch(`${API_URL}/api/leave-requests/pending`, {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                }),
                fetch(`${API_URL}/api/time-change-requests/pending`, {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                })
            ]);

            // Dodajmy sprawdzanie, czy odpowiedzi są OK przed próbą .json()
            const leaveData = leaveRes.ok ? await leaveRes.json() : { error: `HTTP ${leaveRes.status}`};
            const timeData = timeRes.ok ? await timeRes.json() : { error: `HTTP ${timeRes.status}`};

            console.log('AdminDashboard: Odpowiedź leave:', leaveRes.status, leaveData);
            console.log('AdminDashboard: Odpowiedź time:', timeRes.status, timeData);

            if (leaveRes.ok) setLeaveRequests(leaveData);
            else console.error("Błąd pobierania wniosków urlopowych:", leaveData.error || leaveRes.status);

            if (timeRes.ok) setTimeRequests(timeData);
            else console.error("Błąd pobierania wniosków o zmianę czasu:", timeData.error || timeRes.status);

        } catch (error) {
             console.error("Błąd sieci fetchData (AdminDashboard):", error);
             Alert.alert('Błąd Sieci', 'Nie udało się pobrać danych.');
        } finally {
            setLoading(false);
            console.log('AdminDashboard: Zakończono pobieranie danych.');
        }
    };

    useFocusEffect(useCallback(() => { fetchData(); }, [authToken]));

    const handleUpdateLeaveRequest = async (id: number, status: 'approved' | 'rejected') => {
        console.log(`Aktualizuję wniosek urlopowy ${id} na status: ${status}`);
        if (!authToken) return;
        try {
            const response = await fetch(`${API_URL}/api/leave-requests/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ status }),
            });
            console.log(`Odpowiedź serwera dla leave ${id}:`, response.status);
            if (response.ok) {
                Alert.alert('Sukces', `Wniosek urlopowy został ${status === 'approved' ? 'zaakceptowany' : 'odrzucony'}.`);
                fetchData();
            } else {
                const data = await response.json();
                console.error(`Błąd aktualizacji leave ${id}:`, data.error);
                Alert.alert('Błąd', data.error || `Nie udało się zaktualizować statusu (HTTP ${response.status})`);
            }
        } catch (error) {
            console.error(`Błąd sieci podczas aktualizacji leave ${id}:`, error);
            Alert.alert('Błąd Sieci', 'Nie można połączyć się z serwerem.');
        }
    };

    const handleUpdateTimeRequest = async (id: number, status: 'approved' | 'rejected') => {
        console.log(`Aktualizuję wniosek o czas ${id} na status: ${status}`);
        if (!authToken) return;
        try {
            const response = await fetch(`${API_URL}/api/time-change-requests/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ status }),
            });
             console.log(`Odpowiedź serwera dla time ${id}:`, response.status);
            if (response.ok) {
                Alert.alert('Sukces', `Wniosek o zmianę czasu został ${status === 'approved' ? 'zaakceptowany' : 'odrzucony'}.`);
                fetchData();
            } else {
                const data = await response.json();
                console.error(`Błąd aktualizacji time ${id}:`, data.error);
                Alert.alert('Błąd', data.error || `Nie udało się zaktualizować statusu (HTTP ${response.status})`);
            }
        } catch (error) {
             console.error(`Błąd sieci podczas aktualizacji time ${id}:`, error);
             Alert.alert('Błąd Sieci', 'Nie można połączyć się z serwerem.');
        }
    };

    // --- POPRAWIONE renderLeaveRequest ---
    const renderLeaveRequest = ({ item }: { item: PendingLeaveRequest }) => (
        <View style={styles.requestItem}>
            <Text style={styles.employeeName}>{item.full_name}</Text>
            <Text>Od: {new Date(item.start_date).toLocaleDateString('pl-PL')}</Text>
            <Text>Do: {new Date(item.end_date).toLocaleDateString('pl-PL')}</Text>
            {item.reason && <Text>Powód: {item.reason}</Text>}
            <View style={styles.buttonContainer}>
                <Button title="Akceptuj" onPress={() => handleUpdateLeaveRequest(item.id, 'approved')} color="green" />
                <Button title="Odrzuć" onPress={() => handleUpdateLeaveRequest(item.id, 'rejected')} color="red" />
            </View>
        </View>
    );

    // --- POPRAWIONE renderTimeRequest ---
    const renderTimeRequest = ({ item }: { item: PendingTimeRequest }) => (
        <View style={styles.requestItem}>
            <Text style={styles.employeeName}>{item.full_name} - {new Date(item.work_date).toLocaleDateString('pl-PL')}</Text>
            {item.requested_start_time && <Text>Proponowany start: {item.requested_start_time.substring(0, 5)}</Text>}
            {item.requested_end_time && <Text>Proponowany koniec: {item.requested_end_time.substring(0, 5)}</Text>}
            {item.reason && <Text>Powód: {item.reason}</Text>}
            <View style={styles.buttonContainer}>
                <Button title="Akceptuj" onPress={() => handleUpdateTimeRequest(item.id, 'approved')} color="green" />
                <Button title="Odrzuć" onPress={() => handleUpdateTimeRequest(item.id, 'rejected')} color="red" />
            </View>
        </View>
    );

    console.log('AdminDashboard: Renderuję komponent. Loading:', loading); // Dodano log

    return (
        <ScrollView style={styles.container}>
            <View style={styles.navButtonsContainer}>
                <Button title="Zarządzaj Pracownikami" onPress={() => navigation.navigate('EmployeeList')} />
                 {/* Dodajmy odstęp między przyciskami */}
                <View style={{ marginVertical: 5 }} />
                <Button title="Stwórz Grafik" onPress={() => navigation.navigate('ScheduleCreator')} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" style={{ marginTop: 50 }} />
            ) : (
                <>
                    <Text style={styles.title}>Wnioski Urlopowe do rozpatrzenia</Text>
                    <FlatList
                        data={leaveRequests}
                        renderItem={renderLeaveRequest}
                        keyExtractor={(item) => `leave-${item.id.toString()}`}
                        ListEmptyComponent={<Text style={styles.emptyText}>Brak oczekujących wniosków urlopowych.</Text>}
                        scrollEnabled={false} // Ważne przy ScrollView
                    />

                    <Text style={styles.title}>Wnioski o Zmianę Czasu Pracy</Text>
                    <FlatList
                        data={timeRequests}
                        renderItem={renderTimeRequest}
                        keyExtractor={(item) => `time-${item.id.toString()}`}
                        ListEmptyComponent={<Text style={styles.emptyText}>Brak oczekujących wniosków o zmianę czasu.</Text>}
                        scrollEnabled={false} // Ważne przy ScrollView
                    />
                </>
            )}

            <View style={styles.logoutButtonContainer}>
                <Button title="Wyloguj się" onPress={logout} color="red" />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, backgroundColor: '#fff' },
    navButtonsContainer: { marginBottom: 15 },
    title: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10, textAlign: 'center', color: '#333' },
    requestItem: { padding: 15, borderRadius: 8, marginBottom: 10, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6' },
    employeeName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 },
    emptyText: { textAlign: 'center', marginTop: 15, fontStyle: 'italic', color: 'grey' },
    logoutButtonContainer: { marginTop: 30, marginBottom: 20 }
});

export default AdminDashboardScreen;