import { View, Text, Pressable, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import { apiCall } from '../api/client';
import { colors, radius, shadow } from '../theme';

const MyPage = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [canAccessMyEvents, setCanAccessMyEvents] = useState(false);

  useEffect(() => {
    const loadMe = async () => {
      const me = await apiCall('/api/me', {
        method: 'GET',
      });

      if (me.success) {
        const user = me.data?.data || me.data?.user || {};
        setUsername(user.username || '');
        const userRoles = user.roles || [];
        const hasRequiredRole = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_ORGANISATEUR');
        setCanAccessMyEvents(hasRequiredRole);
      }
    };

    loadMe();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Mon espace</Text>
        <Text style={styles.title}>Bonjour {username || ''}</Text>
        <Text style={styles.subtitle}>
          Gere tes informations, tes evenements et ta session depuis cet espace.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.buttonText}>Modifier mon profil</Text>
        </Pressable>

        {canAccessMyEvents && (
          <Pressable
            style={({ pressed }) => [styles.button, styles.myEventsButton, pressed && styles.buttonPressed]}
            onPress={() => navigation.navigate('MyEvents')}
          >
            <Text style={styles.buttonText}>Mes evenements</Text>
          </Pressable>
        )}

        <View style={styles.logoutWrap}>
          <LogoutButton navigation={navigation} color={colors.danger} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    ...shadow.card,
  },
  eyebrow: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.orange,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  myEventsButton: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  logoutWrap: {
    marginTop: 2,
  },
});

export default MyPage;
