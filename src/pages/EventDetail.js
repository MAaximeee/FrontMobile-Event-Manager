import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import React, { useState } from 'react'
import MatchTeams from '../components/MatchTeams'
import JoinEvent from '../components/JoinEvent'
import ListUserEvent from '../components/ListUserEvent'
import { colors, radius, shadow } from '../theme'

const EventDetail = ({ route }) => {
  const { event } = route.params
  const [activeTab, setActiveTab] = useState('details')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleJoinEvent = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Événement non trouvé</Text>
      </View>
    )
  }

  const isMatch = ['football', 'basketball', 'volleyball', 'tennis'].includes(event.type?.toLowerCase())
  const isCourse = ['course', 'running', 'cycling'].includes(event.type?.toLowerCase())

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.actionBar}>
        <JoinEvent 
          event={event}
          onJoinSuccess={handleJoinEvent}
        />
      </View>

      {isMatch && <MatchTeams event={event} key={`match-${refreshKey}`} />}

      <View style={styles.tabsContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Détails
          </Text>
        </Pressable>
        
        <Pressable 
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
            Utilisateurs
          </Text>
        </Pressable>
      </View>

      {activeTab === 'details' && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>{event.title || 'Sans titre'}</Text>
            <Text style={[styles.status, getStatusColor(event.status)]}>
              {event.status?.toUpperCase() || 'N/A'}
            </Text>
          </View>

          {isMatch ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Détails du match</Text>
              {event.type && (
                <Text style={styles.info}>Sport: <Text style={styles.value}>{event.type.charAt(0).toUpperCase() + event.type.slice(1)}</Text></Text>
              )}
              {event.has_teams !== undefined && (
                <Text style={styles.info}>Équipes requises: <Text style={styles.value}>{event.has_teams ? 'Oui' : 'Non'}</Text></Text>
              )}
              {event.allow_participant_create_team !== undefined && (
                <Text style={styles.info}>Création d'équipes: <Text style={styles.value}>{event.allow_participant_create_team ? 'Autorisée' : 'Interdite'}</Text></Text>
              )}
              {event.visibility && (
                <Text style={styles.info}>Visibilité: <Text style={styles.value}>{event.visibility}</Text></Text>
              )}
            </View>
          ) : (
            event.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>À propos</Text>
                <Text style={styles.text}>{event.description}</Text>
              </View>
            )
          )}

          {isCourse && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Détails de la course</Text>
                {event.type && (
                  <Text style={styles.info}>Type: <Text style={styles.value}>{event.type.charAt(0).toUpperCase() + event.type.slice(1)}</Text></Text>
                )}
                <Text style={styles.info}>Distance: <Text style={styles.value}>À définir</Text></Text>
                <Text style={styles.info}>Départ: <Text style={styles.value}>À confirmer</Text></Text>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations</Text>
                {event.dueDate && (
                  <Text style={styles.info}>Date de course: <Text style={styles.value}>{new Date(event.dueDate).toLocaleDateString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}</Text></Text>
                )}
                {event.visibility && (
                  <Text style={styles.info}>Classement: <Text style={styles.value}>{event.visibility}</Text></Text>
                )}
              </View>
            </>
          )}
        </>
      )}
      
      {activeTab === 'users' && (
        <ListUserEvent event={event} key={`users-${refreshKey}`} />
      )}
    </ScrollView>
  )
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return { backgroundColor: colors.orange }
    case 'ongoing':
      return { backgroundColor: colors.info }
    case 'completed':
      return { backgroundColor: colors.success }
    case 'cancelled':
      return { backgroundColor: colors.danger }
    default:
      return { backgroundColor: colors.orange }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24,
  },
  actionBar: {
    marginBottom: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#52525b',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.orange,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#ffffff',
  },
  header: {
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
    padding: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  status: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    borderRadius: radius.xl,
    ...shadow.card,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.orange,
    marginBottom: 10,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  info: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  value: {
    color: colors.text,
    fontWeight: '600',
  },
  meta: {
    color: '#71717a',
    fontSize: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
})

export default EventDetail
