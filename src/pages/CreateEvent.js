import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import React, { useState } from 'react';
import { apiCall } from '../api/client';
import { colors, radius, shadow } from '../theme';

const types = ['football', 'basketball', 'tennis', 'volleyball', 'autosport', 'course'];
const visibilities = ['public', 'private', 'protected'];

const CreateEvent = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('football');
  const [visibility, setVisibility] = useState('public');
  const [hasTeams, setHasTeams] = useState(true);
  const [allowParticipantCreateTeam, setAllowParticipantCreateTeam] = useState(true);
  const [dateDay, setDateDay] = useState('');
  const [dateMonth, setDateMonth] = useState('');
  const [dateYear, setDateYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [visibilityModalVisible, setVisibilityModalVisible] = useState(false);

  const [eventCreated, setEventCreated] = useState(false);
  const [createdEventId, setCreatedEventId] = useState(null);
  const [createdTeams, setCreatedTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('');
  const [teamMaxSize, setTeamMaxSize] = useState('');
  const [teamError, setTeamError] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);

  const formatDatePart = (value, length) => value.padStart(length, '0');

  const getDueDate = () => {
    if (!dateDay || !dateMonth || !dateYear) {
      return '';
    }

    return `${formatDatePart(dateYear, 4)}-${formatDatePart(dateMonth, 2)}-${formatDatePart(dateDay, 2)}`;
  };

  const updateNumericField = (value, setter, maxLength) => {
    setter(value.replace(/\D/g, '').slice(0, maxLength));
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError('Le titre est requis.');
      return false;
    }

    if (!description.trim()) {
      setError('La description est requise.');
      return false;
    }

    const dueDate = getDueDate();
    const dayNumber = Number(dateDay);
    const monthNumber = Number(dateMonth);
    const yearNumber = Number(dateYear);
    const parsedDate = new Date(`${dueDate}T00:00:00`);

    if (!dueDate) {
      setError('La date est requise.');
      return false;
    }

    if (
      dateYear.length !== 4 ||
      dayNumber < 1 ||
      dayNumber > 31 ||
      monthNumber < 1 ||
      monthNumber > 12 ||
      yearNumber < 1900 ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getFullYear() !== yearNumber ||
      parsedDate.getMonth() + 1 !== monthNumber ||
      parsedDate.getDate() !== dayNumber
    ) {
      setError("Date invalide. Verifiez le jour, le mois et l'annee.");
      return false;
    }

    setError('');
    return true;
  };

  const handleCreateEvent = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    const dueDate = getDueDate();

    const response = await apiCall('/api/event/create', {
      method: 'POST',
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        type,
        visibility,
        hasTeams,
        allowParticipantCreateTeam,
        dueDate,
      }),
    });

    setLoading(false);

    if (!response.success) {
      setError(response.error || 'Une erreur est survenue lors de la creation.');
      return;
    }

    const createdEvent = response.data?.data || response.data;
    setCreatedEventId(createdEvent?.id);

    if (hasTeams) {
      setEventCreated(true);
      setCreatedTeams([]);
      setTeamName('');
      setTeamColor('');
      setTeamMaxSize('');
      setTeamError('');
      return;
    }

    Alert.alert('Succes', `Evenement "${createdEvent?.title || title}" cree avec succes.`, [
      { text: 'OK', onPress: () => navigation.navigate('HomeTab') },
    ]);
  };

  const validateTeamForm = () => {
    if (!teamName.trim()) {
      setTeamError("Le nom de l'equipe est requis.");
      return false;
    }

    setTeamError('');
    return true;
  };

  const handleCreateTeam = async () => {
    if (!validateTeamForm()) return;

    setCreatingTeam(true);
    setTeamError('');

    const teamData = {
      name: teamName.trim(),
    };

    if (teamColor.trim()) {
      teamData.color = teamColor.trim();
    }

    if (teamMaxSize.trim()) {
      teamData.maxSize = parseInt(teamMaxSize, 10);
    }

    const response = await apiCall(`/api/event/${createdEventId}/team`, {
      method: 'POST',
      body: JSON.stringify(teamData),
    });

    setCreatingTeam(false);

    if (!response.success) {
      setTeamError(response.error || "Une erreur est survenue lors de la creation de l'equipe.");
      return;
    }

    const createdTeam = response.data?.data || response.data;
    setCreatedTeams((currentTeams) => [...currentTeams, createdTeam]);
    setTeamName('');
    setTeamColor('');
    setTeamMaxSize('');
  };

  const handleFinishTeamCreation = () => {
    Alert.alert('Evenement cree', `Evenement cree avec ${createdTeams.length} equipe(s).`, [
      { text: 'OK', onPress: () => navigation.navigate('HomeTab') },
    ]);
  };

  const renderPickerModal = ({ visible, title: modalTitle, data, value, onSelect, onClose }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{modalTitle}</Text>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.modalItem, item === value && styles.modalItemSelected]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={[styles.modalItemText, item === value && styles.modalItemTextSelected]}>
                  {item}
                </Text>
              </Pressable>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{eventCreated ? 'Equipes' : 'Organisation'}</Text>
          <Text style={styles.heroTitle}>{eventCreated ? 'Ajouter les equipes' : 'Creer un evenement'}</Text>
          <Text style={styles.heroSubtitle}>
            {eventCreated
              ? 'Ajoutez les equipes qui participeront a cet evenement.'
              : 'Configurez le type, la visibilite et les options de participation.'}
          </Text>
        </View>

        {eventCreated && hasTeams ? (
          <View style={styles.card}>
            {teamError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{teamError}</Text>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nouvelle equipe</Text>
              <Text style={styles.label}>Nom de l'equipe</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Equipe A"
                placeholderTextColor={colors.textSubtle}
                value={teamName}
                onChangeText={setTeamName}
                editable={!creatingTeam}
              />

              <Text style={styles.label}>Couleur optionnelle</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: #FF5733"
                placeholderTextColor={colors.textSubtle}
                value={teamColor}
                onChangeText={setTeamColor}
                editable={!creatingTeam}
              />

              <Text style={styles.label}>Taille maximale optionnelle</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 11"
                placeholderTextColor={colors.textSubtle}
                value={teamMaxSize}
                onChangeText={setTeamMaxSize}
                keyboardType="numeric"
                editable={!creatingTeam}
              />
            </View>

            {createdTeams.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Equipes creees ({createdTeams.length})</Text>
                {createdTeams.map((team, index) => (
                  <View key={`${team?.id || team?.name || 'team'}-${index}`} style={styles.teamItem}>
                    <Text style={styles.teamItemText}>{team?.name || 'Equipe'}</Text>
                    {team?.color ? <View style={[styles.teamColorBox, { backgroundColor: team.color }]} /> : null}
                  </View>
                ))}
              </View>
            ) : null}

            {creatingTeam ? (
              <ActivityIndicator size="large" color={colors.orange} style={styles.loader} />
            ) : (
              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={handleCreateTeam}
              >
                <Text style={styles.buttonText}>Ajouter une equipe</Text>
              </Pressable>
            )}

            <Pressable
              style={[styles.button, styles.successButton]}
              onPress={handleFinishTeamCreation}
              disabled={creatingTeam}
            >
              <Text style={styles.buttonText}>Terminer</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations</Text>
              <Text style={styles.label}>Titre de l'evenement</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Tournoi de football"
                placeholderTextColor={colors.textSubtle}
                value={title}
                onChangeText={setTitle}
                editable={!loading}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Decrivez votre evenement"
                placeholderTextColor={colors.textSubtle}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                editable={!loading}
              />

              <Text style={styles.label}>Date de debut</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>Jour</Text>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="JJ"
                    placeholderTextColor={colors.textSubtle}
                    value={dateDay}
                    onChangeText={(value) => updateNumericField(value, setDateDay, 2)}
                    keyboardType="number-pad"
                    maxLength={2}
                    editable={!loading}
                  />
                </View>
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>Mois</Text>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="MM"
                    placeholderTextColor={colors.textSubtle}
                    value={dateMonth}
                    onChangeText={(value) => updateNumericField(value, setDateMonth, 2)}
                    keyboardType="number-pad"
                    maxLength={2}
                    editable={!loading}
                  />
                </View>
                <View style={[styles.dateField, styles.dateYearField]}>
                  <Text style={styles.dateLabel}>Annee</Text>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    placeholder="AAAA"
                    placeholderTextColor={colors.textSubtle}
                    value={dateYear}
                    onChangeText={(value) => updateNumericField(value, setDateYear, 4)}
                    keyboardType="number-pad"
                    maxLength={4}
                    editable={!loading}
                  />
                </View>
              </View>
              <Text style={styles.fieldHint}>Format envoye a l'API : {getDueDate() || 'YYYY-MM-DD'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Parametres</Text>
              <Text style={styles.label}>Type d'evenement</Text>
              <Pressable
                style={[styles.input, styles.selectButton]}
                onPress={() => setTypeModalVisible(true)}
                disabled={loading}
              >
                <Text style={styles.selectButtonText}>{type}</Text>
                <Text style={styles.selectButtonArrow}>v</Text>
              </Pressable>

              <Text style={styles.label}>Visibilite</Text>
              <Pressable
                style={[styles.input, styles.selectButton]}
                onPress={() => setVisibilityModalVisible(true)}
                disabled={loading}
              >
                <Text style={styles.selectButtonText}>{visibility}</Text>
                <Text style={styles.selectButtonArrow}>v</Text>
              </Pressable>

              <View style={styles.switchContainer}>
                <View style={styles.switchTextWrap}>
                  <Text style={styles.switchLabel}>Avec equipes</Text>
                  <Text style={styles.switchHint}>Permet de creer des equipes apres l'evenement.</Text>
                </View>
                <Switch
                  value={hasTeams}
                  onValueChange={setHasTeams}
                  disabled={loading}
                  trackColor={{ false: colors.surfaceElevated, true: colors.border }}
                  thumbColor={hasTeams ? colors.orange : colors.textSubtle}
                />
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchTextWrap}>
                  <Text style={styles.switchLabel}>Creation par participants</Text>
                  <Text style={styles.switchHint}>Autorise les participants a proposer leurs equipes.</Text>
                </View>
                <Switch
                  value={allowParticipantCreateTeam}
                  onValueChange={setAllowParticipantCreateTeam}
                  disabled={loading}
                  trackColor={{ false: colors.surfaceElevated, true: colors.border }}
                  thumbColor={allowParticipantCreateTeam ? colors.orange : colors.textSubtle}
                />
              </View>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={colors.orange} style={styles.loader} />
            ) : (
              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={handleCreateEvent}
              >
                <Text style={styles.buttonText}>Creer l'evenement</Text>
              </Pressable>
            )}

            <Pressable style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()} disabled={loading}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Annuler</Text>
            </Pressable>
          </View>
        )}
      </View>

      {renderPickerModal({
        visible: typeModalVisible,
        title: 'Selectionnez un type',
        data: types,
        value: type,
        onSelect: setType,
        onClose: () => setTypeModalVisible(false),
      })}

      {renderPickerModal({
        visible: visibilityModalVisible,
        title: 'Selectionnez la visibilite',
        data: visibilities,
        value: visibility,
        onSelect: setVisibility,
        onClose: () => setVisibilityModalVisible(false),
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
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
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadow.card,
  },
  section: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    width: '100%',
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.text,
    backgroundColor: colors.surface,
    fontSize: 15,
  },
  textArea: {
    minHeight: 104,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateField: {
    flex: 1,
  },
  dateYearField: {
    flex: 1.35,
  },
  dateLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  dateInput: {
    textAlign: 'center',
    fontWeight: '800',
  },
  fieldHint: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    textTransform: 'capitalize',
  },
  selectButtonArrow: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: '800',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  switchTextWrap: {
    flex: 1,
  },
  switchLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  switchHint: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  errorContainer: {
    backgroundColor: colors.dangerSurface,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '700',
  },
  button: {
    width: '100%',
    minHeight: 48,
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textMuted,
  },
  successButton: {
    backgroundColor: colors.success,
  },
  loader: {
    marginVertical: 18,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  teamItemText: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  teamColorBox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemSelected: {
    backgroundColor: colors.surfaceElevated,
  },
  modalItemText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  modalItemTextSelected: {
    color: colors.orange,
  },
});

export default CreateEvent;
