import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { apiCall } from '../api/client';
import { colors, radius, shadow } from '../theme';

const MyEvent = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadMyEvents = async () => {
    try {
      setError('');
      const response = await apiCall('/api/event/my-events', { method: 'GET' });

      if (response.success) {
        const eventsList = response.data?.data || response.data || [];
        setEvents(Array.isArray(eventsList) ? eventsList : []);
      } else {
        setError(response.error || 'Erreur lors du chargement des evenements');
        setEvents([]);
      }
    } catch (err) {
      setError('Erreur reseau. Verifiez votre connexion.');
      console.error('Error loading events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMyEvents();
  }, []);

  const renderEventItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [styles.eventCard, pressed && styles.eventCardPressed]}
      onPress={() => navigation.navigate('MyEventDetails', { event: item })}
    >
      <View style={styles.cardTop}>
        <Text style={styles.eventTitle} numberOfLines={1}>{item.title || 'Sans titre'}</Text>
        <Text style={styles.eventArrow}>{'>'}</Text>
      </View>
      <Text style={styles.eventDate}>{item.dueDate || 'Date a definir'}</Text>
      <View style={styles.eventMeta}>
        <View style={[styles.badge, styles.badgeVisibility]}>
          <Text style={styles.badgeText}>{item.visibility || 'N/A'}</Text>
        </View>
        <View style={[styles.badge, styles.badgeType]}>
          <Text style={styles.badgeText}>{item.type || 'N/A'}</Text>
        </View>
        {item.hasTeams && (
          <View style={[styles.badge, styles.badgeTeams]}>
            <Text style={styles.badgeText}>Avec equipes</Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Organisation</Text>
        <Text style={styles.title}>Mes evenements</Text>
        <Text style={styles.subtitle}>{events.length} evenement(s) cree(s)</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.button} onPress={loadMyEvents}>
            <Text style={styles.buttonText}>Reessayer</Text>
          </Pressable>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun evenement cree</Text>
          <Pressable style={[styles.button, styles.createButton]} onPress={() => navigation.navigate('CreateEvent')}>
            <Text style={styles.buttonText}>Creer un evenement</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onRefresh={() => {
            setRefreshing(true);
            loadMyEvents();
          }}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable style={[styles.button, styles.backButton]} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Retour</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 14,
  },
  eyebrow: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 12,
    gap: 12,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  eventCardPressed: {
    opacity: 0.9,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  eventDate: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  eventMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.sm,
  },
  badgeVisibility: {
    backgroundColor: colors.surfaceElevated,
  },
  badgeType: {
    backgroundColor: colors.orange,
  },
  badgeTeams: {
    backgroundColor: colors.info,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'capitalize',
  },
  eventArrow: {
    fontSize: 24,
    color: colors.orange,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSubtle,
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: colors.success,
  },
  backButton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
    marginBottom: 4,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default MyEvent;
