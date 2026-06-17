import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native'
import React from 'react'
import { colors, radius, shadow } from '../theme'

const TeamCreationHUD = ({
  teamName,
  setTeamName,
  teamDescription,
  setTeamDescription,
  teamColor,
  setTeamColor,
  teamMaxSize,
  setTeamMaxSize,
  createdTeams,
  isCreatingTeam,
  teamError,
  onCreateTeam,
  onFinishTeamCreation,
  onClose,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Créer une équipe</Text>
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
          disabled={isCreatingTeam}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      <View style={styles.divider} />

      {teamError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{teamError}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Nom de l'équipe</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Équipe A"
        placeholderTextColor="#999"
        value={teamName}
        onChangeText={setTeamName}
        editable={!isCreatingTeam}
      />

      <Text style={styles.label}>Description (optionnel)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description de l'équipe"
        placeholderTextColor="#999"
        value={teamDescription}
        onChangeText={setTeamDescription}
        multiline
        numberOfLines={3}
        editable={!isCreatingTeam}
      />

      <Text style={styles.label}>Couleur (optionnel)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: #FF5733"
        placeholderTextColor="#999"
        value={teamColor}
        onChangeText={setTeamColor}
        editable={!isCreatingTeam}
      />

      <Text style={styles.label}>Taille maximale (optionnel)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 11"
        placeholderTextColor="#999"
        value={teamMaxSize}
        onChangeText={setTeamMaxSize}
        keyboardType="numeric"
        editable={!isCreatingTeam}
      />

      <View style={styles.buttonsContainer}>
        {isCreatingTeam ? (
          <ActivityIndicator size="large" color={colors.orange} style={styles.loader} />
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.createButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onCreateTeam}
          >
            <Text style={styles.buttonText}>Ajouter une équipe</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.button, styles.finishButton]}
          onPress={onFinishTeamCreation}
          disabled={isCreatingTeam}
        >
          <Text style={styles.buttonText}>Terminer</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 12,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
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
    minHeight: 80,
  },
  errorContainer: {
    backgroundColor: colors.dangerSurface,
    padding: 12,
    borderRadius: radius.sm,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '500',
  },
  teamsListContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamsListTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.orange,
    marginBottom: 12,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'space-between',
  },
  teamItemContent: {
    flex: 1,
  },
  teamItemText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  teamItemDescription: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: 2,
  },
  teamColorBox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: 12,
  },
  buttonsContainer: {
    marginTop: 16,
    gap: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    backgroundColor: colors.orange,
  },
  finishButton: {
    backgroundColor: colors.success,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  loader: {
    marginVertical: 12,
  },
})

export default TeamCreationHUD
