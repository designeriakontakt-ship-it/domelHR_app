// src/screens/PayslipScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

 import { API_URL } from '../config/api'; // Użyj swojego IP / localhost

const PayslipScreen = () => {
    const { authToken } = useAuth();
    const [payslips, setPayslips] = useState([]);

    const fetchPayslips = async () => {
        const response = await fetch(`${API_URL}/api/payslips/my`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        if (response.ok) setPayslips(data);
    };

    useFocusEffect(useCallback(() => { fetchPayslips(); }, [authToken]));

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.itemText}>{`Okres: ${item.period_month}/${item.period_year}`}</Text>
            <Button title="Pobierz" onPress={() => alert(`Pobieranie pliku: ${item.file_name}`)} />
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={payslips}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text>Brak dostępnych pasków wynagrodzeń.</Text>}
            />
        </View>
    );
};
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#ccc' },
    itemText: { fontSize: 16 },
});

export default PayslipScreen;