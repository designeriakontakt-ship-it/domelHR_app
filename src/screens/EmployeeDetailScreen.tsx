import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TextInput, Button, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

 import { API_URL } from '../config/api'; // Użyj swojego IP lub localhost dla USB

const EmployeeDetailScreen = ({ route }) => {
    const { employeeId } = route.params;
    const { authToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState(null);
    const [contract, setContract] = useState({ contract_type: '', start_date: '', end_date: '', salary: '' });
    const [entitlement, setEntitlement] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!authToken) return;
            const response = await fetch(`${API_URL}/api/employees/${employeeId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            const data = await response.json();
            if (response.ok) {
                setEmployee(data.employee);
                setEntitlement(data.employee.vacation_days_entitlement.toString());
                if (data.contract) {
                    setContract({
                        ...data.contract,
                        start_date: new Date(data.contract.start_date).toISOString().split('T')[0],
                        end_date: data.contract.end_date ? new Date(data.contract.end_date).toISOString().split('T')[0] : '',
                    });
                }
            }
            setLoading(false);
        };
        fetchDetails();
    }, [employeeId, authToken]);

    const handleSaveContract = async () => { /* ...istniejąca logika... */ };
    const handleSaveEntitlement = async () => { /* ...istniejąca logika... */ };
    const handleUploadPayslip = async () => { /* ...istniejąca logika... */ };

    if (loading) return <ActivityIndicator size="large" style={{flex: 1}} />;
    if (!employee) return <Text>Nie znaleziono pracownika.</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{employee.full_name}</Text>
            <Text style={styles.email}>{employee.email}</Text>

            <Text style={styles.subtitle}>Umowa o pracę</Text>
            <TextInput style={styles.input} placeholder="Typ umowy" value={contract.contract_type} onChangeText={val => setContract(c => ({...c, contract_type: val}))} />
            <TextInput style={styles.input} placeholder="Data rozpoczęcia (RRRR-MM-DD)" value={contract.start_date} onChangeText={val => setContract(c => ({...c, start_date: val}))} />
            <TextInput style={styles.input} placeholder="Data zakończenia (opcjonalnie)" value={contract.end_date} onChangeText={val => setContract(c => ({...c, end_date: val}))} />
            <TextInput style={styles.input} placeholder="Wynagrodzenie" value={String(contract.salary)} onChangeText={val => setContract(c => ({...c, salary: val}))} keyboardType="numeric" />
            <Button title="Zapisz umowę" onPress={handleSaveContract} />
            
            <Text style={styles.subtitle}>Zarządzanie</Text>
            <TextInput style={styles.input} placeholder="Wymiar urlopu (dni)" value={entitlement} onChangeText={setEntitlement} keyboardType="numeric" />
            <Button title="Zapisz wymiar urlopu" onPress={handleSaveEntitlement} />
            <View style={{marginVertical: 5}}/>
            <Button title="Wgraj pasek za ten miesiąc" onPress={handleUploadPayslip} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold' },
    email: { fontSize: 16, color: 'gray', marginBottom: 20 },
    subtitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10, marginBottom: 10 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginBottom: 12, paddingHorizontal: 8 },
});

export default EmployeeDetailScreen;