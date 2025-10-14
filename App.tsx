import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import LoginScreen from './src/screens/LoginScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import HomeScreen from './src/screens/HomeScreen';
import LeaveRequestScreen from './src/screens/LeaveRequestScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import EmployeeListScreen from './src/screens/EmployeeListScreen';
import ScheduleCreatorScreen from './src/screens/ScheduleCreatorScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    const { authToken, userRole } = useAuth();

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {!authToken ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Register" component={RegistrationScreen} options={{ title: "Rejestracja" }} />
                    </>
                ) : userRole === 'employer' ? (
                    <>
                       <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: "Panel Administratora" }}/>
                       <Stack.Screen name="EmployeeList" component={EmployeeListScreen} options={{ title: "Lista Pracowników" }}/>
                       <Stack.Screen name="ScheduleCreator" component={ScheduleCreatorScreen} options={{ title: "Tworzenie Grafiku" }}/>
                    </>
                ) : (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Panel Pracownika" }}/>
                        <Stack.Screen name="LeaveRequests" component={LeaveRequestScreen} options={{ title: "Wnioski Urlopowe" }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

function App(): React.JSX.Element {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}

export default App;