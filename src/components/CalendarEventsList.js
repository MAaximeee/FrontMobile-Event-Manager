import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { colors, radius } from '../theme';
import { eventOrganizerName, parseEventDate } from '../utils/eventCalendar';

function formatSelectedDayLabel(date) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatEventRowDate(dueDate) {
  const d = parseEventDate(dueDate);
  if (!d) return 'Date à définir';
  const hasTime = typeof dueDate === 'string' && dueDate.includes('T');
  if (hasTime) {
    return d.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function EventRow({ event, variant, onSelect }) {
  const highlighted = variant === 'today';
  const organizer = eventOrganizerName(event);

  return (
    <Pressable
      onPress={() => onSelect(event)}
      style={({ pressed }) => [
        styles.eventRow,
        highlighted ? styles.eventRowToday : styles.eventRowDefault,
        pressed && styles.eventRowPressed,
      ]}
    >
      <Text style={[styles.eventTitle, highlighted && styles.eventTitleToday]} numberOfLines={1}>
        {event.title}
      </Text>
      <Text
        style={[styles.eventMeta, highlighted && styles.eventMetaToday]}
        numberOfLines={1}
      >
        {formatEventRowDate(event.dueDate)}
        {organizer ? ` · ${organizer}` : ''}
      </Text>
    </Pressable>
  );
}

export default function CalendarEventsList({
  todayEvents,
  upcomingEvents,
  selectedDay,
  selectedDayEvents,
  loading,
  onSelectEvent,
  onShowTodayAndUpcoming,
}) {
  const showDayFilter = selectedDay != null;
  const selectedDayIsToday =
    showDayFilter && selectedDay.toDateString() === new Date().toDateString();

  const renderBody = () => {
    if (showDayFilter) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {selectedDayIsToday ? "Aujourd'hui" : formatSelectedDayLabel(selectedDay)}
          </Text>
          {loading ? (
            <ActivityIndicator color={colors.orange} style={styles.loader} />
          ) : selectedDayEvents.length === 0 ? (
            <Text style={styles.emptyText}>Aucun événement ce jour-là</Text>
          ) : (
            selectedDayEvents.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                variant={selectedDayIsToday ? 'today' : 'upcoming'}
                onSelect={onSelectEvent}
              />
            ))
          )}
        </View>
      );
    }

    return (
      <>
        <View style={styles.sectionToday}>
          <Text style={styles.sectionLabel}>Aujourd'hui</Text>
          {loading ? (
            <ActivityIndicator color={colors.orange} style={styles.loader} />
          ) : todayEvents.length === 0 ? (
            <Text style={styles.emptyText}>Aucun événement</Text>
          ) : (
            todayEvents.map((event) => (
              <EventRow key={event.id} event={event} variant="today" onSelect={onSelectEvent} />
            ))
          )}
        </View>

        <View style={styles.sectionUpcoming}>
          <Text style={styles.sectionLabel}>Prochainement</Text>
          {loading ? (
            <ActivityIndicator color={colors.orange} style={styles.loader} />
          ) : upcomingEvents.length === 0 ? (
            <Text style={styles.emptyText}>Aucun événement à venir</Text>
          ) : (
            upcomingEvents.map((event) => (
              <EventRow key={event.id} event={event} variant="upcoming" onSelect={onSelectEvent} />
            ))
          )}
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Événements</Text>
        {showDayFilter ? (
          <Pressable onPress={onShowTodayAndUpcoming} hitSlop={8}>
            <Text style={styles.resetLink}>Aujourd'hui & à venir</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        nestedScrollEnabled
      >
        {renderBody()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  resetLink: {
    color: colors.orangeSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  section: {
    marginTop: 8,
  },
  sectionToday: {
    marginTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}99`,
  },
  sectionUpcoming: {
    marginTop: 12,
  },
  sectionLabel: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  loader: {
    marginVertical: 8,
  },
  emptyText: {
    color: colors.textSubtle,
    fontSize: 13,
  },
  eventRow: {
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  eventRowToday: {
    backgroundColor: colors.orange,
  },
  eventRowDefault: {
    backgroundColor: `${colors.background}99`,
    borderWidth: 1,
    borderColor: `${colors.border}cc`,
  },
  eventRowPressed: {
    opacity: 0.88,
  },
  eventTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  eventTitleToday: {
    color: colors.white,
  },
  eventMeta: {
    marginTop: 2,
    color: colors.textSubtle,
    fontSize: 12,
  },
  eventMetaToday: {
    color: '#ffedd5',
  },
});
