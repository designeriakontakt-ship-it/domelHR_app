import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native'; // Dodano View
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>domelHR</Text>
            <TextInput
                style={styles.input}
                placeholder="Adres email"
                                placeholderTextColor="#888" // <-- DODAJ TĘ LINIĘ (kolor ciemnoszary)

                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="Hasło"
                                placeholderTextColor="#888" // <-- DODAJ TĘ LINIĘ (kolor ciemnoszary)

                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Zaloguj się" onPress={() => login(email, password)} />
            <View style={{ marginVertical: 10 }} />
            <Button 
                title="Stwórz konto" 
                onPress={() => navigation.navigate('Register')}
                color="#888"
            />
        </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginBottom: 12, paddingLeft: 8 },
});

export default LoginScreen;