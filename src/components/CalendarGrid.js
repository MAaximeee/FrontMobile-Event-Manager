import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { colors, radius } from '../theme';
import { MONTH_NAMES, DAY_NAMES } from '../utils/eventCalendar';

const TOOLBAR_HEIGHT = 52;
const WEEK_HEADER_HEIGHT = 34;
const GRID_ROWS = 6;

export function getCalendarGridHeight(screenWidth, horizontalPadding = 14) {
  const gridWidth = screenWidth - horizontalPadding * 2;
  const cellSize = Math.floor(gridWidth / 7);
  return TOOLBAR_HEIGHT + WEEK_HEADER_HEIGHT + cellSize * GRID_ROWS;
}

export default function CalendarGrid({
  currentDate,
  calendarDays,
  today,
  selectedDay,
  getEventsForDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onSelectDay,
  canAddEvent,
  onAddEvent,
}) {
  const { width } = useWindowDimensions();
  const horizontalPadding = 14;
  const gridWidth = width - horizontalPadding * 2;
  const cellSize = Math.floor(gridWidth / 7);
  const gridHeight = cellSize * GRID_ROWS;
  const todayKey = today.toDateString();
  const selectedKey = selectedDay?.toDateString() ?? null;

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.monthNav}>
          <Pressable onPress={onPreviousMonth} style={styles.navBtn} hitSlop={8}>
            <Text style={styles.navBtnText}>←</Text>
          </Pressable>
          <Text style={styles.monthTitle} numberOfLines={1}>
            {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <Pressable onPress={onNextMonth} style={styles.navBtn} hitSlop={8}>
            <Text style={styles.navBtnText}>→</Text>
          </Pressable>
        </View>
        <View style={styles.toolbarActions}>
          <Pressable onPress={onToday} style={styles.todayBtn}>
            <Text style={styles.todayBtnText}>Aujourd'hui</Text>
          </Pressable>
          {canAddEvent ? (
            <Pressable onPress={onAddEvent} style={styles.addBtn} accessibilityLabel="Ajouter un événement">
              <Text style={styles.addBtnText}>+</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.weekHeader}>
        {DAY_NAMES.map((day) => (
          <View key={day} style={[styles.weekDayCell, { width: cellSize }]}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.grid, { height: gridHeight }]}>
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const isToday = day.date.toDateString() === todayKey;
          const isSelected = selectedKey === day.date.toDateString();
          const count = dayEvents.length;

          return (
            <Pressable
              key={`${day.date.toISOString()}-${index}`}
              onPress={() => onSelectDay(day.date)}
              style={[
                styles.dayCell,
                { width: cellSize, height: cellSize },
                !day.isCurrentMonth && styles.dayCellOutside,
                isToday && styles.dayCellToday,
                isSelected && styles.dayCellSelected,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  !day.isCurrentMonth && styles.dayNumberOutside,
                  isToday && styles.dayNumberToday,
                  isSelected && styles.dayNumberSelected,
                ]}
              >
                {day.date.getDate()}
              </Text>
              {count > 0 ? (
                <View style={styles.dotsRow}>
                  {dayEvents.slice(0, 3).map((ev) => (
                    <View key={ev.id} style={styles.dot} />
                  ))}
                  {count > 3 ? <Text style={styles.moreDots}>+{count - 3}</Text> : null}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthNav: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  navBtnText: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '600',
  },
  monthTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayBtn: {
    backgroundColor: colors.orange,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  todayBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
  weekHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: `${colors.background}66`,
  },
  weekDayCell: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  weekDayText: {
    color: colors.textSubtle,
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: `${colors.border}99`,
    padding: 6,
    backgroundColor: colors.surface,
  },
  dayCellOutside: {
    backgroundColor: `${colors.background}cc`,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: `${colors.orange}cc`,
  },
  dayCellSelected: {
    backgroundColor: `${colors.surfaceElevated}cc`,
    borderWidth: 1,
    borderColor: `${colors.orangeSoft}aa`,
  },
  dayNumber: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  dayNumberOutside: {
    color: colors.textSubtle,
  },
  dayNumberToday: {
    color: colors.orangeSoft,
  },
  dayNumberSelected: {
    color: '#fdba74',
  },
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 3,
    marginTop: 'auto',
    paddingTop: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.orange,
  },
  moreDots: {
    fontSize: 9,
    color: colors.textSubtle,
  },
});
