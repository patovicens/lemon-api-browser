import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserProfile from '../components/profile/UserProfile';
import { ThemeColors } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

import { ProfileScreenProps } from '../types/profile';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <UserProfile user={user} onLogout={onLogout} />
        
        {/* Add more profile sections here in the future */}
        <View style={styles.section}>
          {/* Future: Account settings, preferences, etc. */}
          <Text>Preferences</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.themeBackground,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.themeSurface,
    marginTop: 20,
    padding: 20,
  },
});

export default ProfileScreen;
