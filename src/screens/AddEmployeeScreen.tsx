import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

 import { API_URL } from '../config/api';// Użyj swojego IP lub localhost dla USB

const AddEmployeeScreen = ({ navigation }) => {
    const { authToken } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAddEmployee = async () => {
        const response = await fetch(`${API_URL}/api/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ full_name: fullName, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
            Alert.alert('Sukces', 'Nowy pracownik został dodany.');
            navigation.goBack();
        } else {
            Alert.alert('Błąd', data.error);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder="Imię i nazwisko" value={fullName} onChangeText={setFullName} />
            <TextInput style={styles.input} placeholder="Adres email" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Hasło tymczasowe" value={password} onChangeText={setPassword} secureTextEntry />
            <Button title="Dodaj pracownika" onPress={handleAddEmployee} />
        </View>
    );
};
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginBottom: 12, paddingHorizontal: 8 },
});

export default AddEmployeeScreen;