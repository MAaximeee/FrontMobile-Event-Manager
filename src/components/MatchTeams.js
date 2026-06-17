import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config/api'
import JoinTeam from './JoinTeam'
import { colors, radius, shadow } from '../theme'
import { handleSessionExpired } from '../api/client'

const MatchTeams = ({ event }) => {
  const [teams, setTeams] = useState([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [isUserInEvent, setIsUserInEvent] = useState(false)
  const [score, setScore] = useState(null)
  const [loadingScore, setLoadingScore] = useState(true)

  useEffect(() => {
    fetchTeams()
    checkIfUserInEvent()
    fetchScore()
  }, [event?.id])

  const fetchTeams = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt_token')
      const response = await fetch(`${API_URL}/api/event/${event.id}/teams`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      })

      if (response.status === 401) {
        await handleSessionExpired()
        return
      }

      if (response.ok) {
        const data = await response.json()
        const teamsList = Array.isArray(data) ? data : data.data || data['hydra:member'] || []
        setTeams(teamsList)
      } else {
        setTeams([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des équipes:', error)
      setTeams([])
    } finally {
      setLoadingTeams(false)
    }
  }

  const checkIfUserInEvent = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt_token')
      
      if (!token) {
        setIsUserInEvent(false)
        return
      }
      const meResponse = await fetch(`${API_URL}/api/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (meResponse.status === 401) {
        await handleSessionExpired()
        return
      }

      if (!meResponse.ok) {
        setIsUserInEvent(false)
        return
      }

      const meData = await meResponse.json()
      const currentUserId = meData.data?.id || meData.user?.id
      
      if (!currentUserId) {
        setIsUserInEvent(false)
        return
      }

      const response = await fetch(`${API_URL}/api/event/${event.id}/participants`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        await handleSessionExpired()
        return
      }

      if (response.ok) {
        const data = await response.json()
        const participants = Array.isArray(data) ? data : data.data || data['hydra:member'] || []
        const userInEvent = participants.some(p => {
          const pUserId = p.user?.id?.toString() || p.userId?.toString()
          return currentUserId && pUserId && pUserId === currentUserId.toString()
        })
        setIsUserInEvent(userInEvent)
      } else {
        setIsUserInEvent(false)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de participation:', error)
      setIsUserInEvent(false)
    }
  }

  const fetchScore = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt_token')
      const response = await fetch(`${API_URL}/api/event/${event.id}/score-match`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      })

      if (response.status === 401) {
        await handleSessionExpired()
        return
      }

      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.data) {
          setScore(data.data.data)
        } else if (data.data) {
          setScore(data.data)
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du score:', error)
    } finally {
      setLoadingScore(false)
    }
  }
  const getTimeString = (dateString) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const getDateString = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { weekday: 'short' })
  }

  const getTeamName = (index) => {
    if (teams && teams.length > index) {
      return teams[index].name || 'TBD'
    }
    return 'TBD'
  }

  const team1Name = getTeamName(0)
  const team2Name = getTeamName(1)
  const isTeamsDetermined = teams && teams.length >= 2
  const timeDisplay = getTimeString(event.dueDate)
  const dateDisplay = getDateString(event.dueDate)

  return (
    <View style={styles.matchCard}>
      <View style={styles.teamsContainer}>
        <View style={styles.teamSection}>
          <View style={styles.teamLogo}>
            <Text style={styles.logoTeam}>1</Text>
          </View>
          <Text style={styles.teamName}>{team1Name}</Text>
          {teams[0] && isUserInEvent && (
            <JoinTeam
              event={event}
              team={teams[0]}
              onJoinSuccess={() => {}}
              onJoinError={() => {}}
            />
          )}
        </View>
        <View style={styles.vsSection}>
          <Text style={styles.matchTime}>{score ? score.scoreTeamA : '-'}</Text>
          <Text style={styles.matchTime}>-</Text>
          <Text style={styles.matchTime}>{score ? score.scoreTeamB : '-'}</Text>
        </View>
        <View style={styles.teamSection}>
          <View style={styles.teamLogo}>
            <Text style={styles.logoTeam}>2</Text>
          </View>
          <Text style={styles.teamName}>{team2Name}</Text>
          {teams[1] && isUserInEvent && (
            <JoinTeam
              event={event}
              team={teams[1]}
              onJoinSuccess={() => {}}
              onJoinError={() => {}}
            />
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  matchCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 20,
    ...shadow.card,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.orange,
  },
  logoTeam: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '700',
  },
  teamName: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  vsSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 16,
  },
  matchTime: {
    color: colors.orange,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  vsText: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  matchDate: {
    color: colors.textMuted,
    fontSize: 12,
  },
})

export default MatchTeams
