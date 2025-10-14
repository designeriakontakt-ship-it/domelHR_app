import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
 import { API_URL } from '../config/api'; // Użyj swojego IP lub localhost z adb reverse

interface Employee {
  id: number;
  full_name: string;
}

const ScheduleCreatorScreen = () => {
    const { authToken } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());

    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            if (!authToken) return;
            try {
                const response = await fetch(`${API_URL}/api/employees`, {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                });
                const data = await response.json();
                if (response.ok) setEmployees(data);
            } catch (error) { console.error(error); }
        };
        fetchEmployees();
    }, [authToken]);

    const handleAddShift = async () => {
        if (!selectedEmployee) {
            Alert.alert("Błąd", "Wybierz pracownika.");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ userId: selectedEmployee, startTime, endTime }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert("Sukces", "Dodano nową zmianę do grafiku.");
            } else {
                Alert.alert("Błąd", data.error);
            }
        } catch (error) {
             Alert.alert("Błąd Sieci", "Nie można połączyć się z serwerem.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dodaj Zmianę do Grafiku</Text>
            
            <Text>Wybierz pracownika:</Text>
            <Picker selectedValue={selectedEmployee} onValueChange={(itemValue) => setSelectedEmployee(itemValue)}>
                <Picker.Item label="-- Wybierz --" value={null} />
                {employees.map(emp => (
                    <Picker.Item key={emp.id} label={emp.full_name} value={emp.id} />
                ))}
            </Picker>

            <TouchableOpacity onPress={() => setOpenStart(true)} style={styles.dateInput}>
                <Text>Czas rozpoczęcia: {startTime.toLocaleString('pl-PL')}</Text>
            </TouchableOpacity>
            <DatePicker modal open={openStart} date={startTime} onConfirm={(date) => { setOpenStart(false); setStartTime(date); }} onCancel={() => setOpenStart(false)} />

            <TouchableOpacity onPress={() => setOpenEnd(true)} style={styles.dateInput}>
                <Text>Czas zakończenia: {endTime.toLocaleString('pl-PL')}</Text>
            </TouchableOpacity>
            <DatePicker modal open={openEnd} date={endTime} onConfirm={(date) => { setOpenEnd(false); setEndTime(date); }} onCancel={() => setOpenEnd(false)} />

            <Button title="Dodaj Zmianę" onPress={handleAddShift} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    dateInput: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginVertical: 10, paddingLeft: 8, justifyContent: 'center' },
});

export default ScheduleCreatorScreen;