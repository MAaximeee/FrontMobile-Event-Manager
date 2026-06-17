import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import AppLogo from '../components/AppLogo';
import React, { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

export default function Login({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        if (!email.includes('@')) {
            setError('Veuillez entrer une adresse email valide');
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const token = response.headers.get('authorization')?.replace('Bearer ', '') || data.token;
                
                if (token) {
                    await AsyncStorage.setItem('jwt_token', token);
                    await AsyncStorage.setItem('user_email', email);
                    if (data.id) {
                        await AsyncStorage.setItem('user_id', data.id.toString());
                    }
                    
                    navigation.replace('Home');
                } else {
                    setError('Token d\'authentification non reçu');
                }
            } else {
                setError(data.message || 'Erreur de connexion. Vérifiez vos identifiants.');
                console.error('Login failed:', data);
            }
        } catch (error) {
            setError('Erreur réseau. Vérifiez que le serveur est accessible.');
            console.error('Error during login:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.logoContainer}>
                        <AppLogo width={220} height={32} />
                    </View>
                    <Text style={styles.title}>Connectez-vous</Text>
                    <View style={styles.divider} />
                    
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Mot de passe"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!loading}
                    />
                    
                    {loading ? (
                        <ActivityIndicator size="large" color="#F04406" style={styles.loader} />
                    ) : (
                        <Pressable 
                            style={({ pressed }) => [
                                styles.button,
                                pressed && styles.buttonPressed
                            ]}
                            onPress={handleLogin}
                        >
                            <Text style={styles.buttonText}>Connexion</Text>
                        </Pressable>
                    )}

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>Pas de compte ? </Text>
                        <Pressable onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>S'inscrire</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#18181b", 
    },
    card: {
        width: "100%",
        padding: 32,
        backgroundColor: "#27272a", 
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    logoContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 2,
    },
    logo: {
        width: 300,
        height: 80,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: "#e4e4e7",
        marginBottom: 24,
    },
    input: {
        width: "100%",
        height: 44,
        backgroundColor: "#fff",
        color: "#000",
        borderRadius: 4,
        paddingHorizontal: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    errorContainer: {
        width: "100%",
        backgroundColor: "#fee2e2",
        borderColor: "#ef4444",
        borderWidth: 1,
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        color: "#991b1b",
        textAlign: "center",
        fontSize: 14,
    },
    button: {
        width: "100%",
        height: 44,
        backgroundColor: "#F04406",
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 16,
    },
    buttonPressed: {
        backgroundColor: "#D63B04",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    loader: {
        marginVertical: 15,
    },
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    registerText: {
        color: "#a1a1a6",
        fontSize: 14,
    },
    registerLink: {
        color: "#f97316",
        fontSize: 14,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});