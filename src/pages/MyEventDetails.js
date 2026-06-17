import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { apiCall } from '../api/client';
import TeamCreationHUD from '../components/TeamCreationHUD';
import { colors, radius, shadow } from '../theme';

const visibilityOptions = ['public', 'private', 'protected'];
const statusOptions = ['pending', 'ongoing', 'completed', 'cancelled'];
const scoreStatusOptions = ['pending', 'ongoing', 'completed'];

const MyEventDetails = ({ route, navigation }) => {
  const { event } = route.params;
  const [activeTab, setActiveTab] = useState('details');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showTeamCreationForm, setShowTeamCreationForm] = useState(false);
  const [editTitle, setEditTitle] = useState(event?.title || '');
  const [editDescription, setEditDescription] = useState(event?.description || '');
  const [editVisibility, setEditVisibility] = useState(event?.visibility || 'public');
  const [editStatus, setEditStatus] = useState(event?.status || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [currentEvent, setCurrentEvent] = useState(event);
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [teamRefreshing, setTeamRefreshing] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamColor, setTeamColor] = useState('');
  const [teamMaxSize, setTeamMaxSize] = useState('');
  const [createdTeams, setCreatedTeams] = useState([]);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamError, setTeamError] = useState('');
  const [scores, setScores] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [teamAForScore, setTeamAForScore] = useState(null);
  const [teamBForScore, setTeamBForScore] = useState(null);
  const [scoreTeamA, setScoreTeamA] = useState('');
  const [scoreTeamB, setScoreTeamB] = useState('');
  const [scoreStatus, setScoreStatus] = useState('completed');
  const [isCreatingScore, setIsCreatingScore] = useState(false);
  const [scoreError, setScoreError] = useState('');
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [editingScore, setEditingScore] = useState(null);

  useEffect(() => {
    if (currentEvent?.id) {
      loadTeams();
      loadScores();
    }
  }, [currentEvent?.id]);

  if (!currentEvent) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Evenement non trouve</Text>
      </View>
    );
  }

  const eventType = currentEvent.type?.toLowerCase();
  const isMatch = ['football', 'basketball', 'volleyball', 'tennis'].includes(eventType);
  const isCourse = ['course', 'running', 'cycling'].includes(eventType);

  const loadTeams = async () => {
    setTeamsLoading(true);
    try {
      const response = await apiCall(`/api/event/${currentEvent.id}/teams`);
      if (response.success) {
        setTeams(response.data?.data || []);
      }
    } catch (err) {
      console.error('Error loading teams:', err);
    } finally {
      setTeamsLoading(false);
    }
  };

  const loadScores = async () => {
    setScoresLoading(true);
    try {
      const response = await apiCall(`/api/event/${currentEvent.id}/score-match`);
      if (response.success) {
        setScores(response.data?.data ? [response.data.data] : []);
      }
    } catch (err) {
      console.error('Error loading scores:', err);
    } finally {
      setScoresLoading(false);
    }
  };

  const handleTeamRefresh = () => {
    setTeamRefreshing(true);
    loadTeams().finally(() => setTeamRefreshing(false));
  };

  const handleEditEvent = async () => {
    if (!editTitle.trim()) {
      setUpdateError('Le titre est requis');
      return;
    }

    setIsUpdating(true);
    setUpdateError('');

    const response = await apiCall(`/api/event/${currentEvent.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        visibility: editVisibility,
        status: editStatus,
      }),
    });

    setIsUpdating(false);

    if (!response.success) {
      setUpdateError(response.error || 'Erreur lors de la modification');
      return;
    }

    setCurrentEvent({
      ...currentEvent,
      title: editTitle.trim(),
      description: editDescription.trim(),
      visibility: editVisibility,
      status: editStatus,
    });
    setEditModalVisible(false);
  };

  const handleDeleteEvent = () => {
    Alert.alert('Confirmation', 'Supprimer cet evenement ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          const response = await apiCall(`/api/event/${currentEvent.id}`, {
            method: 'DELETE',
          });

          if (response.success) {
            navigation.goBack();
          } else {
            Alert.alert('Erreur', response.error || 'Erreur lors de la suppression');
          }
        },
      },
    ]);
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setTeamError("Le nom de l'equipe est requis");
      return;
    }

    setIsCreatingTeam(true);
    setTeamError('');

    const teamData = {
      name: teamName.trim(),
    };

    if (teamDescription.trim()) teamData.description = teamDescription.trim();
    if (teamColor.trim()) teamData.color = teamColor.trim();
    if (teamMaxSize.trim()) teamData.maxSize = parseInt(teamMaxSize, 10);

    const response = await apiCall(`/api/event/${currentEvent.id}/team`, {
      method: 'POST',
      body: JSON.stringify(teamData),
    });

    setIsCreatingTeam(false);

    if (!response.success) {
      setTeamError(response.error || "Erreur lors de la creation de l'equipe");
      return;
    }

    setCreatedTeams((items) => [...items, response.data?.data]);
    setTeamName('');
    setTeamDescription('');
    setTeamColor('');
    setTeamMaxSize('');
    loadTeams();
  };

  const handleFinishTeamCreation = () => {
    setShowTeamCreationForm(false);
    setCreatedTeams([]);
  };

  const handleCreateScore = async () => {
    if (!teamAForScore || !teamBForScore) {
      setScoreError('Les equipes ne sont pas definies');
      return;
    }

    if (!scoreTeamA || !scoreTeamB) {
      setScoreError('Veuillez entrer les scores');
      return;
    }

    setIsCreatingScore(true);
    setScoreError('');

    const scoreData = {
      teamAId: teamAForScore.id,
      teamBId: teamBForScore.id,
      scoreTeamA: parseInt(scoreTeamA, 10),
      scoreTeamB: parseInt(scoreTeamB, 10),
      status: scoreStatus,
    };

    const response = editingScore
      ? await apiCall(`/api/event/${currentEvent.id}/score-match/update`, {
          method: 'PUT',
          body: JSON.stringify({ ...scoreData, id: editingScore.id }),
        })
      : await apiCall(`/api/event/${currentEvent.id}/score-match/create`, {
          method: 'POST',
          body: JSON.stringify(scoreData),
        });

    setIsCreatingScore(false);

    if (!response.success) {
      setScoreError(response.error || 'Une erreur est survenue');
      return;
    }

    resetScoreForm();
    loadScores();
  };

  const handleEditScore = (score) => {
    setEditingScore(score);
    setTeamAForScore(score.teamA);
    setTeamBForScore(score.teamB);
    setScoreTeamA(score.scoreTeamA.toString());
    setScoreTeamB(score.scoreTeamB.toString());
    setScoreStatus(score.status);
    setShowScoreForm(true);
  };

  const resetScoreForm = () => {
    setScoreTeamA('');
    setScoreTeamB('');
    setScoreStatus('completed');
    setEditingScore(null);
    setShowScoreForm(false);
    setScoreError('');
  };

  const openCreateScoreForm = () => {
    if (teams.length >= 2) {
      setTeamAForScore(teams[0]);
      setTeamBForScore(teams[1]);
    }
    if (teams.length === 0) loadTeams();
    setShowScoreForm(true);
    setScoreError('');
  };

  const renderOptionButton = (value, selectedValue, onPress, disabled) => (
    <Pressable
      key={value}
      style={[styles.optionButton, selectedValue === value && styles.optionButtonSelected]}
      onPress={() => onPress(value)}
      disabled={disabled}
    >
      <Text style={[styles.optionButtonText, selectedValue === value && styles.optionButtonTextSelected]}>
        {value}
      </Text>
    </Pressable>
  );

  const renderHero = () => (
    <View style={styles.hero}>
      <View style={styles.heroTop}>
        <View style={styles.heroTitleWrap}>
          <Text style={styles.eyebrow}>Gestion evenement</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>
            {currentEvent.title || 'Sans titre'}
          </Text>
        </View>
        <View style={[styles.statusBadge, getStatusColor(currentEvent.status)]}>
          <Text style={styles.statusText}>{currentEvent.status || 'N/A'}</Text>
        </View>
      </View>
      <View style={styles.heroMetaRow}>
        <InfoPill label="Type" value={currentEvent.type || 'N/A'} />
        <InfoPill label="Visibilite" value={currentEvent.visibility || 'N/A'} />
        <InfoPill label="Date" value={formatDate(currentEvent.dueDate)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <Pressable style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]} onPress={() => setEditModalVisible(true)}>
          <Text style={styles.buttonText}>Modifier</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.actionButton, styles.deleteButton, pressed && styles.buttonPressed]} onPress={handleDeleteEvent}>
          <Text style={styles.buttonText}>Supprimer</Text>
        </Pressable>
      </View>

      <View style={styles.tabsContainer}>
        <TabButton label="Details" active={activeTab === 'details'} onPress={() => setActiveTab('details')} />
        {currentEvent.hasTeams ? (
          <TabButton
            label={`Equipes ${teams.length}`}
            active={activeTab === 'teams'}
            onPress={() => {
              setActiveTab('teams');
              if (teams.length === 0) loadTeams();
            }}
          />
        ) : null}
        {isMatch ? (
          <TabButton
            label={`Scores ${scores.length}`}
            active={activeTab === 'scores'}
            onPress={() => {
              setActiveTab('scores');
              if (scores.length === 0) loadScores();
              if (teams.length === 0) loadTeams();
            }}
          />
        ) : null}
      </View>

      {activeTab === 'details' ? (
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {renderHero()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isMatch ? 'Details du match' : isCourse ? 'Details de la course' : 'Informations'}</Text>
            <InfoLine label="Sport / type" value={capitalize(currentEvent.type || 'N/A')} />
            <InfoLine label="Equipes requises" value={currentEvent.hasTeams ? 'Oui' : 'Non'} />
            <InfoLine label="Creation equipes" value={currentEvent.allowParticipantCreateTeam ? 'Autorisee' : 'Desactivee'} />
            <InfoLine label="Date" value={formatDate(currentEvent.dueDate)} />
            {isCourse ? <InfoLine label="Distance" value="A definir" /> : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.text}>{currentEvent.description || 'Aucune description renseignee.'}</Text>
          </View>
        </ScrollView>
      ) : null}

      {activeTab === 'teams' ? (
        <FlatList
          data={teams}
          keyExtractor={(team) => team.id.toString()}
          refreshing={teamRefreshing}
          onRefresh={handleTeamRefresh}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <>
              {!showTeamCreationForm ? (
                <Pressable
                  style={({ pressed }) => [styles.fullButton, styles.createButton, pressed && styles.buttonPressed]}
                  onPress={() => {
                    setShowTeamCreationForm(true);
                    setTeamError('');
                  }}
                >
                  <Text style={styles.buttonText}>Ajouter une equipe</Text>
                </Pressable>
              ) : null}

              {showTeamCreationForm ? (
                <TeamCreationHUD
                  teamName={teamName}
                  setTeamName={setTeamName}
                  teamDescription={teamDescription}
                  setTeamDescription={setTeamDescription}
                  teamColor={teamColor}
                  setTeamColor={setTeamColor}
                  teamMaxSize={teamMaxSize}
                  setTeamMaxSize={setTeamMaxSize}
                  createdTeams={createdTeams}
                  isCreatingTeam={isCreatingTeam}
                  teamError={teamError}
                  onCreateTeam={handleCreateTeam}
                  onFinishTeamCreation={handleFinishTeamCreation}
                  onClose={() => {
                    setShowTeamCreationForm(false);
                    setCreatedTeams([]);
                    setTeamName('');
                    setTeamDescription('');
                    setTeamColor('');
                    setTeamMaxSize('');
                  }}
                />
              ) : null}
            </>
          )}
          ListEmptyComponent={() => (
            <StateCard loading={teamsLoading} text="Aucune equipe pour cet evenement" />
          )}
          renderItem={({ item: team }) => (
            <Pressable
              style={({ pressed }) => [styles.teamCard, pressed && styles.cardPressed]}
              onPress={() => navigation.navigate('ShowTeam', { eventId: currentEvent.id, teamId: team.id, eventCreatorId: currentEvent.creatorId })}
            >
              <View style={styles.teamCardTop}>
                <View>
                  <Text style={styles.teamName}>{team.name}</Text>
                  {team.description ? <Text style={styles.teamDescription}>{team.description}</Text> : null}
                </View>
                <Text style={styles.cardArrow}>{'>'}</Text>
              </View>
              <Text style={styles.memberCount}>{team.members?.length || 0} membre(s)</Text>
            </Pressable>
          )}
        />
      ) : null}

      {activeTab === 'scores' ? (
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {scoresLoading ? (
            <StateCard loading text="Chargement du score..." />
          ) : scores.length > 0 ? (
            <>
              <ScoreBoard score={scores[0]} />
              <Pressable style={({ pressed }) => [styles.fullButton, pressed && styles.buttonPressed]} onPress={() => handleEditScore(scores[0])}>
                <Text style={styles.buttonText}>Modifier le score</Text>
              </Pressable>
            </>
          ) : (
            <Pressable style={({ pressed }) => [styles.fullButton, styles.createButton, pressed && styles.buttonPressed]} onPress={openCreateScoreForm}>
              <Text style={styles.buttonText}>Ajouter un score</Text>
            </Pressable>
          )}

          {showScoreForm ? (
            <ScoreForm
              title={editingScore ? 'Modifier le score' : 'Ajouter un score'}
              scoreError={scoreError}
              teamAForScore={teamAForScore}
              teamBForScore={teamBForScore}
              scoreTeamA={scoreTeamA}
              setScoreTeamA={setScoreTeamA}
              scoreTeamB={scoreTeamB}
              setScoreTeamB={setScoreTeamB}
              scoreStatus={scoreStatus}
              setScoreStatus={setScoreStatus}
              isCreatingScore={isCreatingScore}
              onSubmit={handleCreateScore}
              onCancel={resetScoreForm}
              renderOptionButton={renderOptionButton}
            />
          ) : null}
        </ScrollView>
      ) : null}

      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalCard} contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier l'evenement</Text>

            {updateError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{updateError}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Titre</Text>
            <TextInput
              style={styles.input}
              placeholder="Titre de l'evenement"
              placeholderTextColor={colors.textSubtle}
              value={editTitle}
              onChangeText={setEditTitle}
              editable={!isUpdating}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor={colors.textSubtle}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              numberOfLines={4}
              editable={!isUpdating}
            />

            <Text style={styles.label}>Visibilite</Text>
            <View style={styles.buttonGroup}>
              {visibilityOptions.map((vis) => renderOptionButton(vis, editVisibility, setEditVisibility, isUpdating))}
            </View>

            <Text style={styles.label}>Statut</Text>
            <View style={styles.buttonGroup}>
              {statusOptions.map((status) => renderOptionButton(status, editStatus, setEditStatus, isUpdating))}
            </View>

            <View style={styles.modalButtonsContainer}>
              {isUpdating ? (
                <ActivityIndicator size="large" color={colors.orange} />
              ) : (
                <>
                  <Pressable style={[styles.modalButton, styles.saveButton]} onPress={handleEditEvent}>
                    <Text style={styles.buttonText}>Enregistrer</Text>
                  </Pressable>
                  <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>Annuler</Text>
                  </Pressable>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const TabButton = ({ label, active, onPress }) => (
  <Pressable style={[styles.tab, active && styles.activeTab]} onPress={onPress}>
    <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
  </Pressable>
);

const InfoPill = ({ label, value }) => (
  <View style={styles.infoPill}>
    <Text style={styles.infoPillLabel}>{label}</Text>
    <Text style={styles.infoPillValue} numberOfLines={1}>{value}</Text>
  </View>
);

const InfoLine = ({ label, value }) => (
  <View style={styles.infoLine}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const StateCard = ({ loading, text }) => (
  <View style={styles.stateCard}>
    {loading ? <ActivityIndicator size="large" color={colors.orange} /> : null}
    <Text style={styles.emptyText}>{text}</Text>
  </View>
);

const ScoreBoard = ({ score }) => (
  <View style={styles.scoreCard}>
    <View style={styles.scoreSide}>
      <Text style={styles.teamNameScore}>{score.teamA?.name || 'Equipe A'}</Text>
      <Text style={styles.scoreValue}>{score.scoreTeamA}</Text>
    </View>
    <View style={styles.scoreMiddle}>
      <Text style={styles.scoreSeparator}>VS</Text>
    </View>
    <View style={styles.scoreSide}>
      <Text style={styles.teamNameScore}>{score.teamB?.name || 'Equipe B'}</Text>
      <Text style={styles.scoreValue}>{score.scoreTeamB}</Text>
    </View>
  </View>
);

const ScoreForm = ({
  title,
  scoreError,
  teamAForScore,
  teamBForScore,
  scoreTeamA,
  setScoreTeamA,
  scoreTeamB,
  setScoreTeamB,
  scoreStatus,
  setScoreStatus,
  isCreatingScore,
  onSubmit,
  onCancel,
  renderOptionButton,
}) => (
  <View style={styles.scoreForm}>
    <Text style={styles.formTitle}>{title}</Text>

    {scoreError ? (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{scoreError}</Text>
      </View>
    ) : null}

    <View style={styles.scoreInputContainer}>
      <ScoreInput label={teamAForScore?.name || 'Equipe A'} value={scoreTeamA} onChangeText={setScoreTeamA} disabled={isCreatingScore} />
      <ScoreInput label={teamBForScore?.name || 'Equipe B'} value={scoreTeamB} onChangeText={setScoreTeamB} disabled={isCreatingScore} />
    </View>

    <Text style={styles.label}>Statut</Text>
    <View style={styles.buttonGroup}>
      {scoreStatusOptions.map((status) => renderOptionButton(status, scoreStatus, setScoreStatus, isCreatingScore))}
    </View>

    <View style={styles.modalButtonsContainer}>
      {isCreatingScore ? (
        <ActivityIndicator size="large" color={colors.orange} />
      ) : (
        <>
          <Pressable style={[styles.modalButton, styles.saveButton]} onPress={onSubmit}>
            <Text style={styles.buttonText}>Valider</Text>
          </Pressable>
          <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
            <Text style={[styles.buttonText, styles.cancelButtonText]}>Annuler</Text>
          </Pressable>
        </>
      )}
    </View>
  </View>
);

const ScoreInput = ({ label, value, onChangeText, disabled }) => (
  <View style={styles.scoreInputGroup}>
    <Text style={styles.scoreLabel}>{label}</Text>
    <TextInput
      style={styles.scoreInput}
      placeholder="0"
      placeholderTextColor={colors.textSubtle}
      value={value}
      onChangeText={onChangeText}
      keyboardType="numeric"
      editable={!disabled}
    />
  </View>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'ongoing':
      return { backgroundColor: colors.info };
    case 'completed':
      return { backgroundColor: colors.success };
    case 'cancelled':
      return { backgroundColor: colors.danger };
    case 'pending':
    default:
      return { backgroundColor: colors.orange };
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'A definir';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  fullButton: {
    minHeight: 48,
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: colors.success,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  activeTab: {
    backgroundColor: colors.orange,
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  activeTabText: {
    color: colors.white,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    ...shadow.card,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  heroTitleWrap: {
    flex: 1,
  },
  eyebrow: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 31,
  },
  statusBadge: {
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoPill: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  infoPillLabel: {
    color: colors.textSubtle,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  infoPillValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadow.card,
  },
  sectionTitle: {
    color: colors.orange,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  infoLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    color: colors.textSubtle,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  infoValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    textAlign: 'right',
  },
  teamCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    ...shadow.card,
  },
  cardPressed: {
    opacity: 0.9,
  },
  teamCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  teamName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  teamDescription: {
    color: colors.textSubtle,
    fontSize: 13,
    lineHeight: 18,
  },
  memberCount: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
  },
  cardArrow: {
    color: colors.orange,
    fontSize: 20,
    fontWeight: '800',
  },
  stateCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: colors.textSubtle,
    fontSize: 14,
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...shadow.card,
  },
  scoreSide: {
    flex: 1,
    alignItems: 'center',
  },
  scoreMiddle: {
    width: 44,
    alignItems: 'center',
  },
  teamNameScore: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreValue: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
  },
  scoreSeparator: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: '800',
  },
  scoreForm: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    ...shadow.card,
  },
  formTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 14,
  },
  scoreInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  scoreInputGroup: {
    flex: 1,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 7,
  },
  scoreInput: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: radius.md,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '92%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  modalContent: {
    padding: 16,
    paddingBottom: 28,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 7,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: radius.md,
    fontSize: 14,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 108,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: '47%',
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  optionButtonSelected: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  optionButtonText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  optionButtonTextSelected: {
    color: colors.white,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  saveButton: {
    backgroundColor: colors.orange,
  },
  cancelButton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textMuted,
  },
  errorContainer: {
    backgroundColor: colors.dangerSurface,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default MyEventDetails;
