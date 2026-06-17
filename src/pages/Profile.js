import {View, Text, Image, TextInput, StyleSheet, ScrollView, ActivityIndicator, Pressable,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiCall } from '../api/client';
import { colors, radius, shadow } from '../theme';

const Profile = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ROLE, setROLE] = useState([]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    const result = await apiCall('/api/me', {
      method: 'GET',
    });

    if (!result.success) {
      setError(result.error || 'Impossible de charger le profil');
      if ((result.error || '').toLowerCase().includes('session expir')) {
        navigation.replace('Login');
      }
      setLoading(false);
      return;
    }

    const user = result.data?.data || result.data?.user || {};
    setUsername(user.username || '');
    setEmail(user.email || '');
    setROLE(user.roles[0] || '');
    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!username.trim() || !email.trim()) {
      setError('Le nom d\'utilisateur et l\'email sont obligatoires');
      return;
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    if (password && password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    const payload = {
      username: username.trim(),
      email: email.trim(),
    };

    if (password) {
      payload.password = password;
    }

    setSaving(true);
    const result = await apiCall('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (!result.success) {
      setError(result.error || 'Erreur lors de la mise à jour du profil');
      if ((result.error || '').toLowerCase().includes('session expir')) {
        navigation.replace('Login');
      }
      setSaving(false);
      return;
    }

    const updatedUser = result.data?.user || {};
    const nextEmail = updatedUser.email || payload.email;
    await AsyncStorage.setItem('user_email', nextEmail);

    setPassword('');
    setConfirmPassword('');
    setSuccess(result.data?.message || 'Profil mis à jour avec succès');
    setSaving(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Modifier mes informations</Text>
          <View style={styles.divider} />

          {loading ? (
            <ActivityIndicator size="large" color="#F04406" />
          ) : (
            <>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {success ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successText}>{success}</Text>
                </View>
              ) : null}
              <Text style={styles.label}>Nom D'Utilisateur :</Text>
              <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                editable={!saving}
              />
              <Text style={styles.label}>Email :</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!saving}
              />
              <Text style={styles.label}>Rôle :</Text>
              <TextInput style={styles.input} value={ROLE} editable={false} />
              <Text style={styles.label}>Changer le mot de passe :</Text>
              <TextInput
                style={styles.input}
                placeholder="Nouveau mot de passe (optionnel)"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!saving}
              />

              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor="#999"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!saving}
              />

              {saving ? (
                <ActivityIndicator size="small" color="#F04406" style={styles.savingLoader} />
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonText}>Enregistrer</Text>
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                ]}
                onPress={loadProfile}
                disabled={saving}
              >
                <Text style={styles.secondaryButtonText}>Recharger mes infos</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </ScrollView>

  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  card: {
    width: '100%',
    padding: 22,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    minHeight: 44,
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
    width: '100%',
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#991b1b',
    textAlign: 'center',
    fontSize: 14,
  },
  successContainer: {
    width: '100%',
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 14,
  },
  successText: {
    color: '#166534',
    textAlign: 'center',
    fontSize: 14,
  },
  button: {
    width: '100%',
    height: 44,
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    backgroundColor: colors.orangeDark,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    height: 40,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: colors.surfaceElevated,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  savingLoader: {
    marginVertical: 12,
  },
  logoutWrap: {
    marginTop: 16,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 2,
  },
  logoContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 2,
  },
  logo: {
        width: 240,
        height: 72,
 },
});

export default Profile
