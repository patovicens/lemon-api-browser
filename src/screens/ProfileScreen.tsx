import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserProfile from '../components/profile/UserProfile';
import { AuthUser } from '../types/auth';
import { colors } from '../theme';

interface ProfileScreenProps {
  user: AuthUser;
  onLogout: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onLogout }) => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: 20,
    padding: 20,
  },
});

export default ProfileScreen;
