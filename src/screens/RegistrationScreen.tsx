import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

// Upewnij się, że ten adres jest poprawny (Twoja domena Hostinger)
const API_URL = 'http://srv1060782.hstgr.cloud';

const RegistrationScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [invitationCode, setInvitationCode] = useState(''); // Stan dla kodu zaproszenia

    const handleRegister = async () => {
        // Dodajmy log, żeby zobaczyć, czy funkcja w ogóle startuje
        console.log('Rozpoczynam handleRegister...');
        try {
            console.log('Wysyłanie zapytania do:', `${API_URL}/api/register`);
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
            console.log('Otrzymano odpowiedź, status:', response.status);

            // Sprawdźmy, czy odpowiedź jest OK, zanim spróbujemy ją przetworzyć
            if (!response.ok) {
                 // Spróbuj odczytać błąd jako tekst, jeśli to nie JSON
                 const errorText = await response.text();
                 console.error('Błąd odpowiedzi serwera:', errorText);
                 Alert.alert('Błąd rejestracji', `Serwer zwrócił błąd: ${response.status}. Treść: ${errorText}. Spróbuj ponownie później.`);
                 return; // Zakończ funkcję po błędzie
            }

            // Jeśli status jest OK, spróbuj przetworzyć JSON
            const data = await response.json();
            console.log('Odpowiedź serwera (JSON):', data);

            Alert.alert('Sukces!', `Konto zostało utworzone z rolą: ${data.role}. Możesz się teraz zalogować.`);
            navigation.goBack();

        } catch (error) {
            // Zaloguj szczegóły błędu sieciowego
            console.error('Błąd podczas fetch:', error);
            Alert.alert('Błąd Sieci', `Nie można połączyć się z serwerem. Szczegóły: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Stwórz Nowe Konto</Text>
            <TextInput
                style={styles.input}
                placeholder="Imię i nazwisko"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="Adres email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="Hasło"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#888"
            />
            <TextInput
                style={styles.input}
                placeholder="Kod firmy (jeśli posiadasz)"
                value={invitationCode}
                onChangeText={setInvitationCode}
                autoCapitalize="none"
                placeholderTextColor="#888"
            />

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