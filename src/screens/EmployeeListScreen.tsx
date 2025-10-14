// src/screens/EmployeeListScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

 import { API_URL } from '../config/api'; // Pamiętaj, aby używać swojego IP

interface Employee {
  id: number;
  full_name: string;
  email: string;
}

const EmployeeListScreen = () => {
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
            const data = await response.json();
            if (response.ok) setEmployees(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useFocusEffect(
        useCallback(() => {
            fetchEmployees();
        }, [authToken])
    );

    const renderItem = ({ item }: { item: Employee }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.name}>{item.full_name}</Text>
            <Text style={styles.email}>{item.email}</Text>
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
                    ListEmptyComponent={<Text>Brak pracowników w systemie.</Text>}
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
    },
    name: { fontSize: 16, fontWeight: 'bold' },
    email: { fontSize: 14, color: 'gray' },
});
// src/screens/EmployeeDetailScreen.tsx (Zaktualizowana wersja)
// ... (importy bez zmian)
const EmployeeDetailScreen = ({ route }) => {
    // ... (istniejące stany bez zmian)
    const [entitlement, setEntitlement] = useState('');
    
    useEffect(() => {
        const fetchDetails = async () => {
            // ... (logika pobierania bez zmian)
            if (response.ok) {
                // ...
                setEntitlement(data.employee.vacation_days_entitlement.toString());
            }
        };
        fetchDetails();
    }, []);

    const handleSaveEntitlement = async () => {
        const response = await fetch(`${API_URL}/api/employees/${employeeId}/vacation-entitlement`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ entitlement: parseInt(entitlement, 10) }),
        });
        if (response.ok) Alert.alert('Sukces', 'Zapisano wymiar urlopu.');
    };

    const handleUploadPayslip = async () => {
        // W prawdziwej aplikacji tutaj byłaby logika wyboru pliku.
        // My na razie zasymulujemy "wgranie".
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();
        const fakeFileName = `payslip_${employeeId}_${month}_${year}.pdf`;

        const response = await fetch(`${API_URL}/api/employees/${employeeId}/payslips`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ file_name: fakeFileName, period_month: month, period_year: year }),
        });
        if (response.ok) Alert.alert('Sukces', `Wgrano pasek: ${fakeFileName}`);
    };

    // ... (reszta kodu bez zmian)

    return (
        <View style={styles.container}>
            {/* ... (dane pracownika i umowa bez zmian) ... */}

            <Text style={styles.subtitle}>Zarządzanie</Text>
            <TextInput style={styles.input} placeholder="Wymiar urlopu (dni)" value={entitlement} onChangeText={setEntitlement} keyboardType="numeric" />
            <Button title="Zapisz wymiar urlopu" onPress={handleSaveEntitlement} />
            <View style={{marginVertical: 5}}/>
            <Button title="Wgraj pasek za ten miesiąc" onPress={handleUploadPayslip} />
        </View>
    );
};
// ... (style bez zmian)
export default EmployeeListScreen;