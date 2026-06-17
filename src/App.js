import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Calendrier from './pages/Calendrier';
import Home from './pages/Home';
import Login from './pages/login';
import Register from './pages/Register';
import EventDetail from './pages/EventDetail';
import Profile from './pages/Profile';
import MyPage from './pages/MyPage';
import CreateEvent from './pages/CreateEvent';
import MyEvent from './pages/MyEvent';
import MyEventDetails from './pages/MyEventDetails';
import ShowTeam from './pages/ShowTeam';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius } from './theme';
import { setSessionExpiredHandler } from './api/client';
import {
  TabCalendarIcon,
  TabCreateIcon,
  TabHomeIcon,
  TabProfileIcon,
} from './components/TabBarIcons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const navigationRef = createNavigationContainerRef();

function Onglet3() {
  return (
    <View style={styles.placeholderScreen}>
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>Contact</Text>
        <Text style={styles.placeholderText}>Fonctionnalite en cours de preparation.</Text>
      </View>
    </View>
  );
}

function Onglet4() {
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}

function HomeNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowIcon: true,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: 7,
        },
        tabBarItemStyle: {
          paddingTop: 8,
          marginHorizontal: 2,
          borderRadius: radius.md,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingHorizontal: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.textSubtle,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={Home}
        options={{
          tabBarLabel: 'Accueil',
          tabBarIcon: ({ color }) => <TabHomeIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Tab2"
        component={Calendrier}
        options={{
          tabBarLabel: 'Calendrier',
          tabBarIcon: ({ color }) => <TabCalendarIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Tab3"
        component={CreateEvent}
        options={{
          tabBarLabel: 'CREER',
          tabBarIcon: ({ color }) => <TabCreateIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Tab4"
        component={MyPage}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <TabProfileIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      if (navigationRef.isReady()) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        setInitialRoute('Login');
      }
    });

    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        setInitialRoute(token ? 'Home' : 'Login');
      } catch (e) {
        console.error('Failed to restore token:', e);
        setInitialRoute('Login');
      }
    };

    bootstrapAsync();
  }, []);

  if (initialRoute === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  return (
    <>
      <StatusBar hidden={true} />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator 
          screenOptions={{ headerShown: false }}
          initialRouteName={initialRoute}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Home" component={HomeNavigation} />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={{
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.orange,
              headerTitleStyle: {
                color: colors.text,
                fontWeight: '700',
              },
              title: 'Mon profil',
            }}
          />
          <Stack.Screen name="MyPage" component={MyPage} />
          <Stack.Screen 
            name="EventDetail" 
            component={EventDetail}
            options={{
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.orange,
              headerTitleStyle: {
                color: colors.text,
                fontWeight: '700',
              },
              title: 'Détails de l\'événement',
            }}
          />
          <Stack.Screen 
            name="CreateEvent" 
            component={CreateEvent}
            options={{
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.orange,
              headerTitleStyle: {
                color: colors.text,
                fontWeight: '700',
              },
              title: 'Créer un événement',
            }}
          />
          <Stack.Screen 
            name="MyEvents" 
            component={MyEvent}
            options={{
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.orange,
              headerTitleStyle: {
                color: colors.text,
                fontWeight: '700',
              },
              title: 'Mes événements',
            }}
          />
          <Stack.Screen 
            name="MyEventDetails" 
            component={MyEventDetails}
            options={{
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.orange,
              headerTitleStyle: {
                color: colors.text,
                fontWeight: '700',
              },
              title: 'Détails de mon événement',
            }}
          />
          <Stack.Screen 
            name="ShowTeam" 
            component={ShowTeam}
            options={{
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.surface,
              },
              headerTintColor: colors.orange,
              headerTitleStyle: {
                color: colors.text,
                fontWeight: '700',
              },
              title: 'Détails de l\'équipe',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderScreen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  placeholderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  placeholderText: {
    color: colors.textSubtle,
    fontSize: 14,
    lineHeight: 20,
  },
});


