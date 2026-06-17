import { View, Text, TextInput, StyleSheet, ActivityIndicator, ScrollView, Pressable, Image } from 'react-native';
import React, { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { colors, radius, shadow } from '../theme';

export default function Register({ navigation }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async () => {
        if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        if (!email.includes('@')) {
            setError('Veuillez entrer une adresse email valide');
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username.trim(),
                    email: email.trim(),
                    password: password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                navigation.replace('Login');
            } else {
                setError(data.message || 'Erreur lors de l\'inscription');
                console.error('Registration failed:', data);
            }
        } catch (error) {
            setError('Erreur réseau. Vérifiez que le serveur est accessible.');
            console.error('Error during registration:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.logoContainer}>
                        <Image 
                            source={require('../assets/logo.png')} 
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.eyebrow}>Event Manager</Text>
                    <Text style={styles.title}>Inscription</Text>
                    <Text style={styles.subtitle}>Creez votre compte pour organiser et rejoindre des evenements.</Text>
                    <View style={styles.divider} />
                    
                    {error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <TextInput
                        style={styles.input}
                        placeholder="Nom d'utilisateur"
                        placeholderTextColor={colors.textSubtle}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        editable={!loading}
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={colors.textSubtle}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Mot de passe"
                        placeholderTextColor={colors.textSubtle}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        editable={!loading}
                    />
                    
                    <TextInput
                        style={styles.input}
                        placeholder="Confirmer le mot de passe"
                        placeholderTextColor={colors.textSubtle}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        editable={!loading}
                    />
                    
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.orange} style={styles.loader} />
                    ) : (
                        <Pressable 
                            style={({ pressed }) => [
                                styles.button,
                                pressed && styles.buttonPressed
                            ]}
                            onPress={handleRegister}
                        >
                            <Text style={styles.buttonText}>Nous rejoindre</Text>
                        </Pressable>
                    )}

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Vous avez déjà un compte ? </Text>
                        <Pressable onPress={() => navigation.replace('Login')}>
                            <Text style={styles.loginLink}>Connexion</Text>
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
        padding: 18,
        backgroundColor: colors.background,
    },
    card: {
        width: "100%",
        padding: 24,
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadow.card,
    },
    logoContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 14,
    },
    logo: {
        width: 240,
        height: 72,
    },
    eyebrow: {
        color: colors.orange,
        fontSize: 12,
        fontWeight: "800",
        textAlign: "center",
        textTransform: "uppercase",
        marginBottom: 6,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: colors.text,
        textAlign: "center",
        marginBottom: 6,
    },
    subtitle: {
        color: colors.textMuted,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 18,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: 20,
    },
    input: {
        width: "100%",
        minHeight: 48,
        backgroundColor: colors.surfaceElevated,
        color: colors.text,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 14,
        marginBottom: 12,
        fontSize: 15,
    },
    errorContainer: {
        width: "100%",
        backgroundColor: "#fee2e2",
        borderColor: "#ef4444",
        borderWidth: 1,
        borderRadius: radius.sm,
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
        height: 48,
        backgroundColor: colors.orange,
        borderRadius: radius.md,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 16,
    },
    buttonPressed: {
        backgroundColor: colors.orangeDark,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: "600",
    },
    loader: {
        marginVertical: 15,
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 16,
    },
    loginText: {
        color: colors.textSubtle,
        fontSize: 14,
    },
    loginLink: {
        color: colors.orangeSoft,
        fontSize: 14,
        fontWeight: "600",
        textDecorationLine: "underline",
    },
});
