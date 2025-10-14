import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-native-date-picker';

 import { API_URL } from '../config/api'; // Użyj swojego IP lub localhost z adb reverse

interface LeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  status: string;
}

const LeaveRequestScreen = () => {
    const { authToken } = useAuth();
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [reason, setReason] = useState('');
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    
    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);

    const fetchLeaveRequests = async () => { /* ... (kod bez zmian, jak w poprzedniej wersji) ... */ };
    useEffect(() => { fetchLeaveRequests(); }, [authToken]);

    const handleSubmit = async () => {
        if (!authToken) return;
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];

        try {
            const response = await fetch(`${API_URL}/api/leave-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ startDate: formattedStartDate, endDate: formattedEndDate, reason }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sukces', 'Wniosek został złożony.');
                fetchLeaveRequests();
            } else {
                Alert.alert('Błąd', data.error);
            }
        } catch (error) { console.error(error); }
    };

    const renderRequest = ({ item }: { item: LeaveRequest }) => (
        <View style={[styles.requestItem, {backgroundColor: item.status === 'approved' ? '#d4edda' : item.status === 'rejected' ? '#f8d7da' : '#fff3cd'}]}>
            <Text>Od: {new Date(item.start_date).toLocaleDateString()}</Text>
            <Text>Do: {new Date(item.end_date).toLocaleDateString()}</Text>
            <Text style={styles.statusText}>Status: {item.status}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Złóż wniosek urlopowy</Text>

            <TouchableOpacity onPress={() => setOpenStart(true)} style={styles.dateInput}>
                <Text>Data początkowa: {startDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <DatePicker modal open={openStart} date={startDate} mode="date" onConfirm={(date) => { setOpenStart(false); setStartDate(date); }} onCancel={() => setOpenStart(false)} />

            <TouchableOpacity onPress={() => setOpenEnd(true)} style={styles.dateInput}>
                <Text>Data końcowa: {endDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <DatePicker modal open={openEnd} date={endDate} mode="date" onConfirm={(date) => { setOpenEnd(false); setEndDate(date); }} onCancel={() => setOpenEnd(false)} />

            <TextInput style={styles.input} placeholder="Powód (opcjonalnie)" value={reason} onChangeText={setReason} />
            <Button title="Wyślij wniosek" onPress={handleSubmit} />

            <Text style={styles.historyTitle}>Twoje wnioski</Text>
            <FlatList data={requests} renderItem={renderRequest} keyExtractor={(item) => item.id.toString()} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginBottom: 12, paddingLeft: 8 },
    dateInput: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginBottom: 12, paddingLeft: 8, justifyContent: 'center' },
    historyTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 24, marginBottom: 16 },
    requestItem: { padding: 10, borderRadius: 5, marginBottom: 10, borderWidth: 1, borderColor: '#ccc'},
    statusText: { fontWeight: 'bold', marginTop: 5 },
});

export default LeaveRequestScreen;