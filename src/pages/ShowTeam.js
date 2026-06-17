import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, FlatList, Modal, TextInput, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { apiCall } from '../api/client'
import { colors, radius, shadow } from '../theme'

const ShowTeam = ({ route, navigation }) => {
  const { eventId, teamId, eventCreatorId } = route.params
  const [team, setTeam] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const teamResponse = await apiCall(`/api/event/${eventId}/team/${teamId}`)
      if (teamResponse.success) {
        const teamData = teamResponse.data?.data || teamResponse.data
        setTeam(teamData)
        setEditName(teamData?.name || '')
        setEditDescription(teamData?.description || '')
      } else {
        setError(teamResponse.error || 'Erreur lors du chargement de l\'équipe')
      }

      const membersResponse = await apiCall(`/api/event/${eventId}/team/${teamId}/members`)
      if (membersResponse.success) {
        const membersData = membersResponse.data?.data || membersResponse.data || []
        setMembers(Array.isArray(membersData) ? membersData : [])
      }

      const userResponse = await apiCall('/api/me')
      if (userResponse.success) {
        setCurrentUser(userResponse.data?.data || userResponse.data)
      }
    } catch (err) {
      setError('Erreur réseau')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const isEventCreatorOrAdmin = () => {
    if (!currentUser) return false
    const isAdmin = currentUser.roles?.includes('ROLE_ADMIN')
    const isCreator = currentUser.id === eventCreatorId
    return isAdmin || isCreator
  }

  const handleUpdateTeam = async () => {
    if (!editName.trim()) {
      Alert.alert('Erreur', 'Le nom de l\'équipe est requis')
      return
    }

    setIsUpdating(true)
    try {
      const response = await apiCall(`/api/event/${eventId}/team/${teamId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
        }),
      })

      if (response.success) {
        const updatedTeam = response.data?.data || response.data
        setTeam(updatedTeam)
        setEditModalVisible(false)
        Alert.alert('Succès', 'Équipe modifiée avec succès')
      } else {
        Alert.alert('Erreur', response.error || 'Erreur lors de la modification')
      }
    } catch (err) {
      Alert.alert('Erreur', 'Erreur réseau')
      console.error('Error updating team:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteTeam = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette équipe ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiCall(`/api/event/${eventId}/team/${teamId}`, {
                method: 'DELETE',
              })

              if (response.success) {
                Alert.alert('Succès', 'Équipe supprimée', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ])
              } else {
                Alert.alert('Erreur', response.error || 'Erreur lors de la suppression')
              }
            } catch (err) {
              Alert.alert('Erreur', 'Erreur réseau')
              console.error('Error deleting team:', err)
            }
          },
        },
      ]
    )
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    )
  }

  if (error || !team) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Équipe non trouvée'}</Text>
        <Pressable
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Retour</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {isEventCreatorOrAdmin() && (
        <View style={styles.actionBar}>
          <Pressable
            style={[styles.button, styles.editButton]}
            onPress={() => setEditModalVisible(true)}
          >
            <Text style={styles.buttonText}>Modifier</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteTeam}
          >
            <Text style={styles.buttonText}>Supprimer</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>{team.name}</Text>
      </View>

      {team.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.text}>{team.description}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <Text style={styles.info}>
          Nombre de membres: <Text style={styles.value}>{members.length}</Text>
        </Text>
        {team.createdAt && (
          <Text style={styles.info}>
            Créée le: <Text style={styles.value}>{new Date(team.createdAt).toLocaleDateString('fr-FR')}</Text>
          </Text>
        )}
      </View>

      {members.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membres ({members.length})</Text>
          <FlatList
            scrollEnabled={false}
            data={members}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={({ item }) => (
              <View style={styles.memberItem}>
                <Text style={styles.memberName}>
                  {item.user?.email || item.email || 'Utilisateur'}
                </Text>
                {item.role && (
                  <Text style={styles.memberRole}>{item.role}</Text>
                )}
              </View>
            )}
          />
        </View>
      )}

      <Pressable
        style={[styles.button, styles.backButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Retour</Text>
      </Pressable>

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier l'équipe</Text>

            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom de l'équipe"
              placeholderTextColor="#999"
              value={editName}
              onChangeText={setEditName}
              editable={!isUpdating}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor="#999"
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              numberOfLines={4}
              editable={!isUpdating}
            />

            <View style={styles.modalButtonsContainer}>
              {isUpdating ? (
                <ActivityIndicator size="large" color={colors.orange} />
              ) : (
                <>
                  <Pressable
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={handleUpdateTeam}
                  >
                    <Text style={styles.buttonText}>Enregistrer</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setEditModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Annuler</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  section: {
    marginHorizontal: 12,
    marginBottom: 20,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.orange,
    marginBottom: 8,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  info: {
    color: colors.textSubtle,
    fontSize: 13,
    marginBottom: 6,
  },
  value: {
    color: colors.text,
    fontWeight: '600',
  },
  memberItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberName: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  memberRole: {
    color: colors.textSubtle,
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: colors.orange,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  backButton: {
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: 12,
    marginVertical: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    color: colors.textSubtle,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    fontSize: 14,
  },
  textArea: {
    textAlignVertical: 'top',
    paddingVertical: 10,
    minHeight: 100,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: colors.orange,
  },
  cancelButton: {
    backgroundColor: colors.surfaceElevated,
  },
})

export default ShowTeam
