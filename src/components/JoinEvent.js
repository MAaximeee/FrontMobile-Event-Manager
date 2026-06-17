import { View, Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_URL } from '../config/api'
import { colors, radius } from '../theme'
import { handleSessionExpired } from '../api/client'

const JoinEvent = ({ event, onJoinSuccess, onJoinError }) => {
  const [isJoining, setIsJoining] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const canManageParticipation = event?.status?.toLowerCase() === 'pending'

  useEffect(() => {
    const initCheck = async () => {
      setIsLoading(true)
      await verifyUserStatus()
      setIsLoading(false)
    }
    initCheck()
  }, [event?.id])

  useFocusEffect(
    React.useCallback(() => {
      const refreshStatus = async () => {
        await verifyUserStatus()
      }
      refreshStatus()
    }, [event?.id])
  )

  const verifyUserStatus = async () => {
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

      const participantsResponse = await fetch(`${API_URL}/api/event/${event.id}/participants`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (participantsResponse.status === 401) {
        await handleSessionExpired()
        return
      }

      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json()
        const participants = Array.isArray(participantsData) ? participantsData : participantsData.data || participantsData['hydra:member'] || []
        
        const userInEvent = participants.some(p => {
          const pUserId = p.user?.id?.toString() || p.userId?.toString()
          return currentUserId && pUserId && pUserId === currentUserId.toString()
        })
        
        setIsJoined(userInEvent)
      } else {
        setIsJoined(false)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de participation:', error)
      setIsJoined(false)
    }
  }

  const checkIfUserJoined = verifyUserStatus

  const handleJoinEvent = async () => {
    if (!canManageParticipation) {
      onJoinError?.("Les inscriptions sont fermees pour cet evenement")
      return
    }

    try {
      setIsJoining(true)
      const token = await AsyncStorage.getItem('jwt_token')
      
      if (!token) {
        onJoinError?.('No authentication token')
        return
      }

      const response = await fetch(`${API_URL}/api/event/${event.id}/join`, {
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
          checkIfUserJoined()
        }, 500)
      } else if (response.status === 409) {
        setIsJoined(true)
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

  const handleLeaveEvent = async () => {
    if (!canManageParticipation) {
      onJoinError?.("Les inscriptions sont fermees pour cet evenement")
      return
    }

    try {
      setIsJoining(true)
      const token = await AsyncStorage.getItem('jwt_token')
      
      if (!token) {
        onJoinError?.('No authentication token')
        return
      }

      const response = await fetch(`${API_URL}/api/event/${event.id}/leave`, {
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
        setTimeout(() => {
          checkIfUserJoined()
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
      onPress={isJoined ? handleLeaveEvent : handleJoinEvent}
      disabled={isJoining || isLoading || !canManageParticipation}
    >
      {isJoining || isLoading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.joinButtonText}>
          {!canManageParticipation ? 'Inscriptions fermees' : isJoined ? 'Quitter' : 'Rejoindre'}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  joinButtonContainer: {
    backgroundColor: colors.orange,
    paddingVertical: 12,
    width: '100%',
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
    fontSize: 16,
    fontWeight: '700',
  },
})

export default JoinEvent
