import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
 import { API_URL } from '../config/api';
 // Upewnij się, że ten adres jest poprawny dla Twojego połączenia (USB)

const RegistrationScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [invitationCode, setInvitationCode] = useState(''); // Stan dla kodu zaproszenia

    const handleRegister = async () => {
        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    full_name: fullName, 
                    invitationCode // Wysyłamy kod do backendu
                }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sukces!', `Konto zostało utworzone z rolą: ${data.role}. Możesz się teraz zalogować.`);
                navigation.goBack();
            } else {
                Alert.alert('Błąd rejestracji', data.error);
            }
        } catch (error) {
            Alert.alert('Błąd Sieci', 'Nie można połączyć się z serwerem.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Stwórz Nowe Konto</Text>
            <TextInput style={styles.input} placeholder="Imię i nazwisko" value={fullName} onChangeText={setFullName} />
            <TextInput style={styles.input} placeholder="Adres email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Hasło" value={password} onChangeText={setPassword} secureTextEntry />
            {/* TO JEST NOWE POLE */}
            <TextInput style={styles.input} placeholder="Kod firmy (jeśli posiadasz)" value={invitationCode} onChangeText={setInvitationCode} autoCapitalize="none" />
            
            <Button title="Zarejestruj się" onPress={handleRegister} />
            <View style={{marginTop: 10}}/>
            <Button title="Anuluj" onPress={() => navigation.goBack()} color="gray"/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginBottom: 12, paddingLeft: 8 },
});

export default RegistrationScreen;