import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import LeaveBalance from '../components/LeaveBalance';
// Upewnij się, że ten adres jest poprawny
const API_URL = 'http://srv1060782.hstgr.cloud';

// Konfiguracja języka polskiego dla kalendarza
LocaleConfig.locales['pl'] = {
  monthNames: ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'],
  monthNamesShort: ['Sty.','Lut.','Mar.','Kwi.','Maj','Cze.','Lip.','Sie.','Wrz.','Paź.','Lis.','Gru.'],
  dayNames: ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'],
  dayNamesShort: ['Nd.','Pon.','Wt.','Śr.','Czw.','Pt.','Sob.'],
  today: 'Dzisiaj'
};
LocaleConfig.defaultLocale = 'pl';

interface LeaveRequest {
  id: number;
  start_date: string;
  end_date: string;
  status: string;
}

const LeaveRequestScreen = () => {
    const { authToken } = useAuth();
    const [reason, setReason] = useState('');
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    // Usunięto stan markedDates, obliczymy go w useMemo
    const [period, setPeriod] = useState({ start: '', end: '' });

    // Funkcja pobierająca wnioski (bez zmian)
    const fetchLeaveRequests = async () => {
        if (!authToken) return;
        try {
            const response = await fetch(`${API_URL}/api/leave-requests/my`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            if (response.ok) setRequests(data);
            else console.error("Błąd pobierania wniosków:", data.error);
        } catch (error) { console.error("Błąd sieci fetchLeaveRequests:", error); }
    };
    useEffect(() => {
        fetchLeaveRequests();
    }, [authToken]);

    // Obsługa kliknięcia dnia (bez zmian)
    const onDayPress = (day) => {
        let newPeriod = { start: '', end: '' };
        if (!period.start || (period.start && period.end)) { // Resetuj lub zacznij nowy okres
            newPeriod = { start: day.dateString, end: '' };
        } else { // Ustaw datę końcową
             // Zapobiegaj ustawieniu daty końcowej przed początkową
             if (new Date(day.dateString) >= new Date(period.start)) {
                  newPeriod = { ...period, end: day.dateString };
             } else {
                  // Jeśli kliknięto wcześniejszą datę, zacznij nowy okres od niej
                  newPeriod = { start: day.dateString, end: '' };
             }
        }
        setPeriod(newPeriod);
    };

    // Obliczanie zaznaczonych dat - POPRAWIONA, BEZPIECZNIEJSZA WERSJA
    const calculatedMarkedDates = useMemo(() => {
        const dates = {};
        if (!period.start) {
            return dates; // Zwróć pusty obiekt, jeśli nie ma daty początkowej
        }

        let current = new Date(period.start);
        // Jeśli nie ma daty końcowej, zaznacz tylko początkową
        const end = period.end ? new Date(period.end) : new Date(period.start);

        // Zabezpieczenie przed nieskończoną pętlą - max 1 rok
        let iterations = 0;
        const maxIterations = 365;

        // Upewnij się, że data końcowa nie jest wcześniejsza niż początkowa
        if (end < current) {
             // Jeśli jakimś cudem end jest przed start, zaznacz tylko start
             return { [period.start]: { startingDay: true, endingDay: true, color: '#5f9ea0', textColor: 'white' }};
        }

        while (current <= end && iterations < maxIterations) {
            const dateString = current.toISOString().split('T')[0];
            dates[dateString] = {
                startingDay: dateString === period.start,
                endingDay: dateString === period.end && period.start !== period.end, // endingDay tylko jeśli okres > 1 dzień
                color: '#5f9ea0',
                textColor: 'white',
                // Dodaj kropkę dla pojedynczego dnia
                ...(period.start === period.end && { marked: true, dotColor: 'white' })
            };

            // Jeśli start === end, zaznacz tylko jeden dzień
            if (period.start === period.end) {
                 dates[dateString].startingDay = true;
                 dates[dateString].endingDay = true;
            }


            // Twórz *nową* datę dla następnej iteracji zamiast modyfikować starą
            const nextDate = new Date(current);
            nextDate.setDate(nextDate.getDate() + 1);
            current = nextDate;
            iterations++;
        }

        if (iterations >= maxIterations) {
             console.warn("Obliczanie zaznaczonych dat przekroczyło limit iteracji.");
        }

        return dates;
    }, [period.start, period.end]); // Zależność od start i end

    // Obsługa wysłania wniosku (bez zmian)
    const handleSubmit = async () => {
        if (!authToken || !period.start || !period.end) {
            Alert.alert('Błąd', 'Wybierz datę początkową i końcową urlopu.');
            return;
        }
        // Upewnij się, że end nie jest przed start (chociaż UI powinno tego pilnować)
        if (new Date(period.end) < new Date(period.start)) {
             Alert.alert('Błąd', 'Data końcowa nie może być wcześniejsza niż początkowa.');
             return;
        }
        try {
            const response = await fetch(`${API_URL}/api/leave-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ startDate: period.start, endDate: period.end, reason }),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Sukces', 'Wniosek został złożony.');
                fetchLeaveRequests();
                setPeriod({ start: '', end: '' });
                setReason('');
            } else {
                Alert.alert('Błąd', data.error);
            }
        } catch (error) { console.error(error); Alert.alert('Błąd Sieci', 'Nie można połączyć się z serwerem.');}
    };

    // Renderowanie pojedynczego wniosku (bez zmian)
    const renderRequest = ({ item }: { item: LeaveRequest }) => (
        <View style={[styles.requestItem, {backgroundColor: item.status === 'approved' ? '#d4edda' : item.status === 'rejected' ? '#f8d7da' : '#fff3cd'}]}>
            <Text>Od: {new Date(item.start_date).toLocaleDateString('pl-PL')}</Text>
            <Text>Do: {new Date(item.end_date).toLocaleDateString('pl-PL')}</Text>
            <Text style={styles.statusText}>
    Status: {
        item.status === 'approved' ? 'Zatwierdzony' :
        item.status === 'rejected' ? 'Odrzucony' :
        'Oczekujący'
    }
</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <LeaveBalance /> {/* Dodaj komponent salda */}
            
            <Text style={styles.title}>Złóż wniosek urlopowy</Text>
            <Calendar
                onDayPress={onDayPress}
                markingType={'period'}
                markedDates={calculatedMarkedDates} // Użyj poprawionej zmiennej
                theme={{
                    todayTextColor: '#00adf5',
                    arrowColor: '#00adf5',
                    'stylesheet.calendar.header': { // Dodatkowe style dla dni tygodnia
                        week: {
                            marginTop: 5,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }
                    }
                }}
                // Pokaż dni tygodnia
                hideExtraDays={false}
                firstDay={1} // Poniedziałek jako pierwszy dzień tygodnia
            />
            
            <TextInput style={styles.input} placeholder="Powód (opcjonalnie)" value={reason} onChangeText={setReason} placeholderTextColor="#888"/>
            <Button title="Wyślij wniosek" onPress={handleSubmit} />
            <Text style={styles.historyTitle}>Twoje wnioski</Text>
            <FlatList
                data={requests}
                renderItem={renderRequest}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false} // Wyłącz przewijanie FlatList, bo mamy ScrollView
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginVertical: 12, paddingLeft: 8 },
    historyTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 24, marginBottom: 16 },
    requestItem: { padding: 10, borderRadius: 5, marginBottom: 10, borderWidth: 1, borderColor: '#ccc'},
    statusText: { fontWeight: 'bold', marginTop: 5 },
});

export default LeaveRequestScreen;