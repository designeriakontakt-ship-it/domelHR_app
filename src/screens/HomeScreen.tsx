import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

// Upewnij się, że ten adres jest poprawny (Twoja domena Hostinger)
const API_URL = 'http://srv1060782.hstgr.cloud';

interface ScheduleEntry {
  id: string; // Może być 'def-...' lub 'exc-...' lub 'chg-...' lub 'leave-...'
  date: string; // Format YYYY-MM-DD
  start_time?: string; // Opcjonalne dla urlopu (odbieramy jako ISO string UTC)
  end_time?: string;   // Opcjonalne dla urlopu (odbieramy jako ISO string UTC)
  is_exception: boolean;
  is_approved_change?: boolean;
  is_leave?: boolean; // Dodane pole dla urlopu
}

const HomeScreen = ({ navigation }) => {
    const { logout, authToken } = useAuth();
    const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [error, setError] = useState<string | null>(null); // Stan na błąd

    const fetchSchedule = async (year: number, month: number) => {
        if (!authToken) return;
        setLoading(true);
        setError(null); // Resetuj błąd przed próbą
        console.log(`[HomeScreen] Pobieranie grafiku dla ${year}-${month}...`);
        try {
            const response = await fetch(`${API_URL}/api/schedule/my?year=${year}&month=${month}`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            });
            console.log('[HomeScreen] Odpowiedź serwera status:', response.status);

            if (!response.ok) {
                let errorMsg = `HTTP Error: ${response.status}`;
                try {
                    // Spróbuj odczytać JSON z błędem, jeśli serwer go wysłał
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) {
                    // Jeśli odpowiedź nie jest JSONem, użyj statusu HTTP
                    errorMsg = `Błąd serwera (${response.status})`;
                 }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            // Sprawdź, czy odpowiedź jest tablicą
            if (!Array.isArray(data)) {
                 throw new Error("Otrzymano nieprawidłowe dane z serwera (oczekiwano tablicy).");
            }
            console.log('[HomeScreen] Otrzymano dane grafiku:', data.length, 'wpisów');
            setSchedule(data);

        } catch (err) {
            console.error("[HomeScreen] Błąd podczas fetchSchedule:", err);
            setError(err.message || 'Nie można połączyć się z serwerem.');
            setSchedule([]); // Wyzeruj grafik w razie błędu
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1;
            fetchSchedule(year, month);
        }, [authToken, currentMonth])
    );

    const renderScheduleItem = ({ item }: { item: ScheduleEntry }) => {
        try {
             // Parsuj datę jako UTC, aby uniknąć problemów ze strefą
             const dateParts = item.date.split('-');
             if (dateParts.length !== 3) throw new Error("Nieprawidłowy format daty z API");
             const date = new Date(Date.UTC(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])));
             if (isNaN(date.getTime())) throw new Error("Nieprawidłowa data po parsowaniu");

             const dateFormatOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' };
             const weekdayFormatOptions: Intl.DateTimeFormatOptions = { weekday: 'short', timeZone: 'UTC' };

             const displayDate = date.toLocaleDateString('pl-PL', dateFormatOptions);
             const dayOfWeek = date.toLocaleDateString('pl-PL', weekdayFormatOptions);

             // --- Logika dla URLOPU ---
             if (item.is_leave) {
                 return (
                     <View style={[styles.scheduleItem, styles.leaveItem]}>
                         <Text style={styles.dateText}>{displayDate} ({dayOfWeek})</Text>
                         <Text style={styles.leaveText}>URLOP</Text>
                     </View>
                 );
             }
             // --- Koniec logiki dla URLOPU ---

             // Formatowanie czasu (tylko jeśli istnieje i jest poprawny)
             const timeFormatOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' };
             let startTime = 'Brak';
             let endTime = 'Brak';
             if(item.start_time) {
                  const startDate = new Date(item.start_time);
                  if(!isNaN(startDate.getTime())) startTime = startDate.toLocaleTimeString('pl-PL', timeFormatOptions);
             }
              if(item.end_time) {
                  const endDate = new Date(item.end_time);
                  if(!isNaN(endDate.getTime())) endTime = endDate.toLocaleTimeString('pl-PL', timeFormatOptions);
             }


             return (
                 <TouchableOpacity
                     style={[
    styles.scheduleItem, // Bazowy styl zawsze
    item.is_leave ? styles.leaveItem : // Jeśli urlop, dodaj styl urlopu
    item.is_approved_change ? styles.approvedChangeItem : // Inaczej, jeśli zmiana czasu, dodaj jej styl
    item.is_exception ? styles.exceptionItem : null // Inaczej, jeśli wyjątek, dodaj jego styl
]}
                     onPress={() => navigation.navigate('TimeChangeRequest', { workDate: item.date })}
                 >
                     <Text style={styles.dateText}>{displayDate} ({dayOfWeek})</Text>
                     <Text>{`Godziny: ${startTime} - ${endTime}`}</Text>
                     {item.is_exception && !item.is_approved_change && <Text style={styles.infoText}>(Zmiana niestandardowa)</Text>}
                     {item.is_approved_change && <Text style={styles.infoText}>(Zatwierdzona zmiana czasu)</Text>}
                 </TouchableOpacity>
             );
           } catch(renderError) {
               console.error("[HomeScreen] Błąd renderowania wpisu grafiku:", item, renderError);
               // Zwróć komponent błędu, aby nie crashować całej listy
               return <View style={styles.scheduleItem}><Text style={{color: 'red'}}>Błąd renderowania dnia: {item.date}</Text></View>;
           }
    };

    const changeMonth = (amount: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            // Używamy setUTCMonth, aby uniknąć problemów ze strefami czasowymi
            newDate.setUTCMonth(newDate.getUTCMonth() + amount);
            return newDate; // Zawsze zwracaj nową datę, blokadę zrobimy w przycisku
        });
    };

     // Sprawdzenie, czy bieżący miesiąc to nie jest przyszły miesiąc
     const isFutureMonth = (() => {
         const now = new Date();
         // Porównujemy rok i miesiąc (miesiące są 0-11)
         return currentMonth.getFullYear() > now.getFullYear() || (currentMonth.getFullYear() === now.getFullYear() && currentMonth.getMonth() >= now.getMonth());
     })();


    return (
        <View style={styles.container}>
            {/* --- Poprawiony Układ Nawigacji Miesiąca --- */}
            <View style={styles.monthSelector}>
                 <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.arrowButton}>
                     <Text style={styles.arrowText}>&lt;</Text>
                 </TouchableOpacity>
                 <Text style={styles.monthText}>
                     {/* Używamy UTC, aby miesiąc był poprawny */}
                     {currentMonth.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                 </Text>
                 {/* Przycisk "Następny" jest wyłączony dla bieżącego i przyszłych miesięcy */}
                 <TouchableOpacity onPress={() => changeMonth(1)} disabled={isFutureMonth} style={styles.arrowButton}>
                     <Text style={[styles.arrowText, isFutureMonth && styles.disabledArrow]}>&gt;</Text>
                 </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" style={styles.loader} />
            ) : error ? ( // Wyświetl komunikat o błędzie, jeśli wystąpił
                <Text style={styles.errorText}>Błąd ładowania grafiku: {error}</Text>
            ) : (
                <FlatList
                    data={schedule}
                    renderItem={renderScheduleItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={<Text style={styles.emptyText}>Brak grafiku na ten miesiąc.</Text>}
                    contentContainerStyle={{ paddingBottom: 80 }} // Zwiększony padding na dole listy
                />
            )}

            {/* --- Dolna Nawigacja --- */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('LeaveRequests')}>
                    <Text style={styles.navButtonText}>Urlopy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navButton, styles.disabledNavButton]} disabled>
                    <Text style={styles.navButtonText}>Paski</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navButton, styles.logoutButton]} onPress={logout}>
                     <Text style={[styles.navButtonText, styles.logoutText]}>Wyloguj</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// --- NOWE / ZMIENIONE Style ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderColor: '#dee2e6',
    },
    arrowButton: {
        padding: 10,
        minWidth: 40,
        alignItems: 'center',
    },
    arrowText: {
        fontSize: 24,
        color: '#007bff',
    },
    disabledArrow: {
        color: '#adb5bd', // Szary dla nieaktywnej strzałki
    },
    monthText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#495057',
        textAlign: 'center',
        flex: 1, // Aby tekst był wyśrodkowany
    },
    loader: {
        marginTop: '50%',
    },
    scheduleItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 10,
        marginTop: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e9ecef',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    exceptionItem: {
        backgroundColor: '#fff3cd',
        borderColor: '#ffeeba',
    },
    approvedChangeItem: {
        backgroundColor: '#d1ecf1',
        borderColor: '#bee5eb',
    },
    leaveItem: { // Dodano styl dla urlopu
        backgroundColor: '#d4edda', // Zielonkawe tło
        borderColor: '#c3e6cb',
        // Usunięto alignItems: 'center' aby data była po lewej
    },
    leaveText: { // Dodano styl dla tekstu "URLOP"
        fontSize: 16,
        fontWeight: 'bold',
        color: '#155724', // Ciemnozielony
        marginTop: 5, // Mały odstęp od daty
    },
    dateText: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#343a40',
    },
    infoText: {
        fontStyle: 'italic',
        fontSize: 12,
        color: '#6c757d',
        marginTop: 3,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontStyle: 'italic',
        fontSize: 16,
        color: '#6c757d',
    },
     errorText: { // Dodano styl dla błędu
         textAlign: 'center',
         marginTop: 50,
         color: 'red',
         fontSize: 16,
         paddingHorizontal: 20,
     },
    bottomNav: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#f8f9fa',
        borderTopWidth: 1,
        borderColor: '#dee2e6',
        alignItems: 'center',
    },
    navButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    navButtonText: {
        fontSize: 14,
        color: '#007bff',
    },
    logoutButton: {
        // Można dodać specyficzny styl
    },
    logoutText: {
         color: '#dc3545', // Czerwony kolor dla wylogowania
    },
    disabledNavButton: {
        opacity: 0.5,
    },
});

export default HomeScreen; 