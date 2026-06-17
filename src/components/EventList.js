import { View, Text, StyleSheet, ActivityIndicator, FlatList, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';
import { colors, radius, shadow } from '../theme';
import { handleSessionExpired } from '../api/client';

const eventTypes = ['football', 'basketball', 'running', 'tennis'];

const typeLabels = {
  football: 'FO',
  basketball: 'BA',
  running: 'RU',
  tennis: 'TE',
  training: 'TR',
  course: 'CO',
  match: 'MA',
};

const statusLabels = {
  pending: 'A venir',
  ongoing: 'En cours',
  completed: 'Termine',
  cancelled: 'Annule',
};

const EventList = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('jwt_token');
      const response = await fetch(`${API_URL}/api/event/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.status === 401) {
        await handleSessionExpired();
        return;
      }

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError.message);
        setError(response.ok ? 'Reponse serveur invalide' : `Erreur serveur ${response.status}`);
        return;
      }

      if (response.ok) {
        if (Array.isArray(data)) setEvents(data);
        else if (Array.isArray(data.data)) setEvents(data.data);
        else if (Array.isArray(data['hydra:member'])) setEvents(data['hydra:member']);
        else setEvents([]);
      } else {
        setError(data.message || data.msg || `Erreur ${response.status}`);
      }
    } catch (eventError) {
      setError(`Erreur: ${eventError.message}`);
      console.error('Error during event fetch:', eventError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return 'Date a definir';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });
  };

  const filteredEvents = selectedType
    ? events.filter((event) => (event.type || '').toLowerCase() === selectedType)
    : events;

  const renderEventCard = ({ item }) => {
    const type = (item.type || '').toLowerCase();
    const status = item.status || 'pending';

    return (
      <Pressable
        style={({ pressed }) => [styles.eventCard, pressed && styles.cardPressed]}
        onPress={() => navigation.navigate('EventDetail', { event: item })}
      >
        <View style={styles.cardTop}>
          <View style={styles.typeIconContainer}>
            <Text style={styles.typeIcon}>{typeLabels[type] || 'EV'}</Text>
          </View>
          <View style={styles.cardTitleSection}>
            <Text style={styles.eventTitle} numberOfLines={1}>{item.title || 'Sans titre'}</Text>
            <Text style={styles.eventDescription} numberOfLines={2}>
              {item.description || 'Aucune description'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoPill}>
            <Text style={styles.infoPillLabel}>Type</Text>
            <Text style={styles.infoPillValue}>{item.type || 'N/A'}</Text>
          </View>
          <View style={styles.infoPill}>
            <Text style={styles.infoPillLabel}>Visibilite</Text>
            <Text style={styles.infoPillValue}>{item.visibility || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>{formatDueDate(item.dueDate)}</Text>
          <View style={[styles.statusBadge, getStatusColor(status)]}>
            <Text style={styles.statusBadgeText}>{statusLabels[status] || status}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.orange} />
        <Text style={styles.loadingText}>Chargement des evenements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Explorer</Text>
        <Text style={styles.headerTitle}>Evenements</Text>
        <Text style={styles.headerSubtitle}>{filteredEvents.length} evenement(s) disponible(s)</Text>
      </View>

      <View style={styles.filterContainer}>
        <Pressable
          style={[styles.filterButton, selectedType === null && styles.filterButtonActive]}
          onPress={() => setSelectedType(null)}
        >
          <Text style={[styles.filterButtonText, selectedType === null && styles.filterButtonTextActive]}>
            Tous
          </Text>
        </Pressable>
        {eventTypes.map((type) => (
          <Pressable
            key={type}
            style={[styles.filterButton, selectedType === type && styles.filterButtonActive]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[styles.filterButtonText, selectedType === type && styles.filterButtonTextActive]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun evenement trouve</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id?.toString() || `${item.title}-${item.dueDate}`}
          contentContainerStyle={styles.listContent}
          onRefresh={() => {
            setRefreshing(true);
            fetchEvents();
          }}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'ongoing':
      return styles.statusOngoing;
    case 'completed':
      return styles.statusCompleted;
    case 'cancelled':
      return styles.statusCancelled;
    case 'pending':
    default:
      return styles.statusPending;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: 12,
    fontSize: 14,
  },
  hero: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 18,
    marginBottom: 12,
  },
  eyebrow: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  filterButtonText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
  },
  filterButtonTextActive: {
    color: colors.white,
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
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 18,
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
  cardPressed: {
    opacity: 0.9,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeIcon: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.orange,
  },
  cardTitleSection: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 13,
    color: colors.textSubtle,
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  infoPill: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoPillLabel: {
    fontSize: 11,
    color: colors.textSubtle,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoPillValue: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateText: {
    flex: 1,
    fontSize: 13,
    color: colors.orange,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  statusPending: {
    backgroundColor: colors.orange,
  },
  statusOngoing: {
    backgroundColor: colors.info,
  },
  statusCompleted: {
    backgroundColor: colors.success,
  },
  statusCancelled: {
    backgroundColor: colors.danger,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSubtle,
  },
});

export default EventList;
