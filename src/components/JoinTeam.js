import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config/api'
import { colors, radius } from '../theme'
import { handleSessionExpired } from '../api/client'

const JoinTeam = ({ event, team, onJoinSuccess, onJoinError }) => {
  const [isJoining, setIsJoining] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const canManageParticipation = event?.status?.toLowerCase() === 'pending'

  useEffect(() => {
    const initCheck = async () => {
      setIsLoading(true)
      await verifyUserTeamStatus()
      setIsLoading(false)
    }
    initCheck()
  }, [event?.id, team?.id])

  const verifyUserTeamStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt_token')
      
      if (!token) {
        setIsJoined(false)
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
        setIsJoined(false)
        return
      }

      const meData = await meResponse.json()
      const currentUserId = meData.data?.id || meData.user?.id

      const teamMembersResponse = await fetch(`${API_URL}/api/event/${event.id}/team/${team.id}/members`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (teamMembersResponse.status === 401) {
        await handleSessionExpired()
        return
      }

      if (teamMembersResponse.ok) {
        const membersData = await teamMembersResponse.json()
        const members = Array.isArray(membersData) ? membersData : membersData.data || membersData['hydra:member'] || []
        
        const userInTeam = members.some(m => {
          const mUserId = m.user?.id?.toString() || m.userId?.toString()
          return currentUserId && mUserId && mUserId === currentUserId.toString()
        })
        
        setIsJoined(userInTeam)
      } else {
        setIsJoined(false)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'équipe:', error)
      setIsJoined(false)
    }
  }

  const handleJoinTeam = async () => {
    if (!canManageParticipation) {
      onJoinError?.("Les inscriptions sont fermees pour cet evenement")
      return
    }

    try {
      setIsJoining(true)
      const token = await AsyncStorage.getItem('jwt_token')
      
      if (!token) {
        onJoinError?.('No authentication token')
        setIsJoining(false)
        return
      }

      const response = await fetch(`${API_URL}/api/event/${event.id}/team/${team.id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        await handleSessionExpired()
        return
      }

      if (response.ok) {
        setIsJoined(true)
        onJoinSuccess?.()
      
        setTimeout(() => {
          verifyUserTeamStatus()
        }, 500)
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || `Erreur ${response.status}`
        onJoinError?.(errorMessage)
      }
    } catch (error) {
      onJoinError?.(error.message)
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeaveTeam = async () => {
    if (!canManageParticipation) {
      onJoinError?.("Les inscriptions sont fermees pour cet evenement")
      return
    }

    try {
      setIsJoining(true)
      const token = await AsyncStorage.getItem('jwt_token')
      
      if (!token) {
        onJoinError?.('No authentication token')
        setIsJoining(false)
        return
      }

      const response = await fetch(`${API_URL}/api/event/${event.id}/team/${team.id}/leave`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.status === 401) {
        await handleSessionExpired()
        return
      }

      if (response.ok) {
        setIsJoined(false)
        onJoinError?.()
        setTimeout(() => {
          verifyUserTeamStatus()
        }, 500)
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || `Erreur ${response.status}`
        onJoinError?.(errorMessage)
      }
    } catch (error) {
      onJoinError?.(error.message)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Pressable 
      style={[
        styles.joinButtonContainer,
        isJoined && styles.joinedButton,
        !canManageParticipation && styles.disabledButton,
      ]}
      onPress={isJoined ? handleLeaveTeam : handleJoinTeam}
      disabled={isJoining || isLoading || !canManageParticipation}
    >
      {isJoining || isLoading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.joinButtonText}>
          {!canManageParticipation ? 'Ferme' : isJoined ? 'Quitter' : 'Rejoindre'}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  joinButtonContainer: {
    backgroundColor: colors.orange,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.orange,
  },
  joinedButton: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
  },
  disabledButton: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    opacity: 0.65,
  },
  joinButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
})

export default JoinTeam
