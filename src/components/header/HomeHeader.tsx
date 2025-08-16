import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUserCircle, faRotate, faSearch, faTimes, faArrowUpWideShort, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeColors } from '../../theme';

interface HomeHeaderProps {
  isFetching?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onSearch?: (query: string) => void;
  onSearchSubmit?: (query: string) => void;
  onToggleFilters?: () => void;
  isFiltersVisible?: boolean;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ 
  isFetching = false, 
  isRefreshing = false, 
  onRefresh,
  onSearch,
  onSearchSubmit,
  onToggleFilters,
  isFiltersVisible = false
}) => {
  const { user, handleLogout } = useAuth();
  const { colors, theme, toggleTheme } = useTheme();
  const styles = createStyles(colors);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const toggleSearch = () => {
    if (isSearchActive) {
      // Close search
      Animated.parallel([
        Animated.timing(searchAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(iconRotation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start(() => {
        setIsSearchActive(false);
        setSearchQuery('');
        if (onSearch) onSearch('');
      });
    } else {
      // Open search
      setIsSearchActive(true);
      Animated.parallel([
        Animated.timing(searchAnimation, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(iconRotation, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start(() => {
        searchInputRef.current?.focus();
      });
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (onSearch) onSearch(text);
  };

  

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.profileButtonContent}>
              <FontAwesomeIcon icon={faUserCircle} size={20} color={colors.themeText} />
              <Text style={styles.profileButtonText}>
                {user?.email ? `@${user.email.split('@')[0]}` : '@User'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={toggleTheme}
            style={styles.themeToggleButton}
          >
            <FontAwesomeIcon 
              icon={theme === 'dark' ? faSun : faMoon} 
              size={14} 
              color={colors.themeTextSecondary} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerRight}>
          {isFetching && !isRefreshing && (
            <Text style={styles.updatingText}>Updating...</Text>
          )}
          <TouchableOpacity 
            onPress={handleRefresh} 
            style={styles.iconButton}
            disabled={isRefreshing || isFetching}
          >
            <FontAwesomeIcon 
              icon={faRotate} 
              size={18} 
              color={isRefreshing || isFetching ? colors.themeTextTertiary : colors.themeTextSecondary} 
            />
          </TouchableOpacity>
          

          
          <TouchableOpacity 
            onPress={onToggleFilters}
            style={[styles.iconButton, isFiltersVisible && styles.iconButtonActive]}
          >
            <FontAwesomeIcon 
              icon={faArrowUpWideShort} 
              size={20} 
              color={isFiltersVisible ? colors.lemon : colors.themeTextSecondary} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={toggleSearch} 
            style={styles.iconButton}
          >
            <Animated.View style={{
              transform: [{
                rotate: iconRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '90deg'],
                })
              }]
            }}>
              <FontAwesomeIcon 
                icon={isSearchActive ? faTimes : faSearch} 
                size={18} 
                color={colors.themeTextSecondary} 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={[
        styles.searchContainer,
        {
          height: searchAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 56],
          }),
          opacity: searchAnimation,
          paddingTop: searchAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
          }),
          transform: [{
            scaleY: searchAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            })
          }],
        }
      ]}>
        <Animated.View style={{
          opacity: searchAnimation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.8, 1],
          }),
          transform: [{
            translateY: searchAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [-10, 0],
            })
          }]
        }}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search cryptocurrencies..."
            placeholderTextColor={colors.themeTextTertiary}
            value={searchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (onSearchSubmit && searchQuery.trim()) {
                onSearchSubmit(searchQuery.trim());
              }
            }}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  header: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.themeSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.themeBorder,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileButton: {
    backgroundColor: colors.themeSurface,
    borderWidth: 1,
    borderColor: colors.themeBorder,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: colors.themeText,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  themeToggleButton: {
    padding: 6,
    borderRadius: 8,
  },
  profileButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.themeText,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  iconButtonActive: {
    backgroundColor: colors.lemonLight,
  },
  updatingText: {
    fontSize: 14,
    color: colors.themeTextSecondary,
    fontStyle: 'italic',
  },
  searchContainer: {
    width: '100%',
    backgroundColor: colors.themeSurface,
    paddingHorizontal: 0,
    paddingVertical: 6,
  },
  searchContent: {
    width: '100%',
  },
  searchInput: {
    width: '100%',
    height: 40,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.themeText,
    backgroundColor: colors.themeSurfaceLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.themeBorder,
  },
});

export default HomeHeader;
