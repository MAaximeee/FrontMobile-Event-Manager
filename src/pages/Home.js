import { View, StyleSheet } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import EventList from '../components/EventList'
import { colors } from '../theme'

const Home = ({ navigation }) => {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.contentWrap}>
        <EventList />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
})
export default Home
