import { Pressable, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius } from '../theme';

const LogoutButton = ({ navigation, color = colors.danger }) => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('jwt_token');
      await AsyncStorage.removeItem('user_email');
      await AsyncStorage.removeItem('user_id');
      navigation.replace('Login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, borderColor: color },
        pressed && styles.buttonPressed,
      ]}
      onPress={handleLogout}
    >
      <Text style={styles.buttonText}>Se deconnecter</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default LogoutButton;
