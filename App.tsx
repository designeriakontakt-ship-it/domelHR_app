import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Import WSZYSTKICH ekranów
import LoginScreen from './src/screens/LoginScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import HomeScreen from './src/screens/HomeScreen';
import LeaveRequestScreen from './src/screens/LeaveRequestScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import EmployeeListScreen from './src/screens/EmployeeListScreen';
import ScheduleCreatorScreen from './src/screens/ScheduleCreatorScreen';
import TimeChangeApprovalScreen from './src/screens/TimeChangeApprovalScreen';
import SetDefaultScheduleScreen from './src/screens/SetDefaultScheduleScreen';
import TimeChangeRequestScreen from './src/screens/TimeChangeRequestScreen';
import SetVacationScreen from './src/screens/SetVacationScreen'; // Upewniono się, że jest import

const Stack = createNativeStackNavigator();

// Komponent nawigatora, który decyduje co wyświetlić
const AppNavigator = () => {
    const { authToken, userRole } = useAuth(); // Pobieramy stan logowania i rolę

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {!authToken ? (
                    // Ekrany dostępne przed zalogowaniem
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Register" component={RegistrationScreen} options={{ title: "Rejestracja" }} />
                    </>
                ) : userRole === 'employer' ? (
                    // Ekrany dostępne po zalogowaniu jako PRACODAWCA
                    <>
                       <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: "Panel Administratora" }}/>
                       <Stack.Screen name="EmployeeList" component={EmployeeListScreen} options={{ title: "Lista Pracowników" }}/>
                       <Stack.Screen name="ScheduleCreator" component={ScheduleCreatorScreen} options={{ title: "Tworzenie Grafiku" }}/>
                       <Stack.Screen name="TimeChangeApproval" component={TimeChangeApprovalScreen} options={{ title: "Zatwierdzanie Zmian Czasu" }}/>
                       <Stack.Screen name="SetDefaultSchedule" component={SetDefaultScheduleScreen} options={{ title: "Ustaw Domyślny Grafik" }}/>
                       {/* DODANO BRAKUJĄCY EKRAN */}
                       <Stack.Screen name="SetVacation" component={SetVacationScreen} options={{ title: "Ustaw Wymiar Urlopu" }}/>
                    </>
                ) : (
                    // Ekrany dostępne po zalogowaniu jako PRACOWNIK
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Panel Pracownika" }}/>
                        <Stack.Screen name="LeaveRequests" component={LeaveRequestScreen} options={{ title: "Wnioski Urlopowe" }} />
                        <Stack.Screen name="TimeChangeRequest" component={TimeChangeRequestScreen} options={{ title: "Wniosek o Zmianę Czasu" }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// Główny komponent App, który "opakowuje" całą aplikację
function App(): React.JSX.Element {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}

export default App;