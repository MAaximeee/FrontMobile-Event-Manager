import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config/api'
import { colors, radius, shadow } from '../theme'
import { handleSessionExpired } from '../api/client'

const ListUserEvent = ({ event }) => {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchParticipants()
  }, [event?.id])

  const fetchParticipants = async () => {
    try {
      setLoading(true)
      const token = await AsyncStorage.getItem('jwt_token')
      const response = await fetch(
        `${API_URL}/api/event/${event.id}/participants`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
          },
        }
      )

      if (response.status === 401) {
        await handleSessionExpired()
        return
      }

      if (response.ok) {
        const data = await response.json()
        const participantsList = Array.isArray(data)
          ? data
          : data.data || data['hydra:member'] || []
        setParticipants(participantsList)
      } else {
        setParticipants([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des participants:', error)
      setParticipants([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.orange} size="large" />
        <Text style={styles.loadingText}>Chargement des participants...</Text>
      </View>
    )
  }

  if (participants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucun participant pour l'instant</Text>
      </View>
    )
  }

  const renderUserCard = ({ item, index }) => (
    <View style={styles.userCard}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.user?.username?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {item.user?.username || 'Unknown'}
        </Text>
        <Text style={styles.userEmail} numberOfLines={1}>
          {item.user?.email || 'N/A'}
        </Text>
        {item.status && (
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusBadgeText}>{item.status}</Text>
          </View>
        )}
      </View>
      <View style={styles.indexContainer}>
        <Text style={styles.indexText}>#{index + 1}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}> Participants ({participants.length})</Text>
      </View>
      <FlatList
        data={participants}
        renderItem={renderUserCard}
        keyExtractor={(item, index) => index.toString()}
        scrollEnabled={false}
      />
    </View>
  )
}

const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return { backgroundColor: colors.success }
    case 'pending':
      return { backgroundColor: colors.orange }
    case 'rejected':
      return { backgroundColor: colors.danger }
    default:
      return { backgroundColor: colors.border }
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
    ...shadow.card,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    color: colors.orange,
    fontSize: 15,
    fontWeight: '700',
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: colors.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  indexContainer: {
    marginLeft: 12,
  },
  indexText: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 40,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 12,
  },
  emptyContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 40,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 12,
  },
})

export default ListUserEvent
