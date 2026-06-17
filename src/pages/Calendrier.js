import { View, StyleSheet, Text } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CalendarGrid from '../components/CalendarGrid';
import CalendarEventsList from '../components/CalendarEventsList';
import { colors } from '../theme';
import { apiCall } from '../api/client';
import { fetchAllEvents } from '../utils/eventsApi';
import {
  buildCalendarDays,
  filterEventsByCalendarDay,
  listUpcomingEventsAfterToday,
  startOfCalendarDay,
} from '../utils/eventCalendar';

export default function Calendrier() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canAddEvent, setCanAddEvent] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    const { events: nextEvents, error: fetchError } = await fetchAllEvents();
    if (fetchError) setError(fetchError);
    setEvents(nextEvents);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents]),
  );

  useEffect(() => {
    const checkRoles = async () => {
      const result = await apiCall('/api/me', { method: 'GET' });
      if (!result.success) {
        setCanAddEvent(false);
        return;
      }
      const user = result.data?.user || result.data?.data || {};
      const roles = user.roles || [];
      setCanAddEvent(roles.includes('ROLE_ORGANISATEUR') || roles.includes('ROLE_ADMIN'));
    };
    checkRoles();
  }, []);

  const calendarDays = useMemo(() => buildCalendarDays(currentDate), [currentDate]);
  const today = useMemo(() => new Date(), []);

  const getEventsForDate = useCallback(
    (date) => filterEventsByCalendarDay(events, date),
    [events],
  );

  const todayEvents = useMemo(
    () => filterEventsByCalendarDay(events, new Date()),
    [events],
  );

  const upcomingEvents = useMemo(() => listUpcomingEventsAfterToday(events), [events]);

  const selectedDayEvents = useMemo(
    () => (selectedDay ? filterEventsByCalendarDay(events, selectedDay) : []),
    [events, selectedDay],
  );

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const handleSelectDay = (date) => {
    setSelectedDay(startOfCalendarDay(date));
  };

  const goToEventDetail = (event) => {
    if (event?.id == null) return;
    navigation.getParent()?.navigate('EventDetail', { event });
  };

  const handleAddEvent = () => {
    navigation.navigate('Tab3');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 8 }]}>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.main}>
        <CalendarEventsList
          todayEvents={todayEvents}
          upcomingEvents={upcomingEvents}
          selectedDay={selectedDay}
          selectedDayEvents={selectedDayEvents}
          loading={loading}
          onSelectEvent={goToEventDetail}
          onShowTodayAndUpcoming={() => setSelectedDay(null)}
        />

        <CalendarGrid
          currentDate={currentDate}
          calendarDays={calendarDays}
          today={today}
          selectedDay={selectedDay}
          getEventsForDate={getEventsForDate}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
          onSelectDay={handleSelectDay}
          canAddEvent={canAddEvent}
          onAddEvent={handleAddEvent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
  },
  main: {
    flex: 1,
    minHeight: 0,
  },
  errorBanner: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSurface,
  },
  errorText: {
    color: '#fecaca',
    fontSize: 13,
  },
});
