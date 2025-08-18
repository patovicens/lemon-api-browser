import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
  Platform,
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
  const refreshIconRotation = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef<TextInput>(null);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    if (isFetching && !isRefreshing) {
      const startRotation = () => {
        setIsRotating(true);
        refreshIconRotation.setValue(0);
        Animated.loop(
          Animated.timing(refreshIconRotation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ).start();
      };
      startRotation();
    } else if (isRotating) {
      // Complete the current rotation if it's in progress
      setIsRotating(false);
      Animated.timing(refreshIconRotation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        refreshIconRotation.setValue(0);
      });
    }
  }, [isFetching, isRefreshing, refreshIconRotation, isRotating]);

  const handleRefresh = () => {
    if (onRefresh && !isRotating) {
      setIsRotating(true);
      refreshIconRotation.setValue(0);
      Animated.timing(refreshIconRotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        refreshIconRotation.setValue(0);
        setIsRotating(false);
      });
      
      onRefresh();
    }
  };

  const toggleSearch = () => {
    if (isSearchActive) {
      searchInputRef.current?.blur();
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
              <FontAwesomeIcon icon={faUserCircle} size={20} color={colors.darkBackground} />
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
          <TouchableOpacity 
            onPress={handleRefresh} 
            style={styles.iconButton}
            disabled={isRefreshing || isFetching || isRotating}
          >
            <Animated.View style={{
              transform: [{
                rotate: refreshIconRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                })
              }]
            }}>
              <FontAwesomeIcon 
                icon={faRotate} 
                size={18} 
                color={isRefreshing || isFetching ? colors.themeTextTertiary : colors.themeTextSecondary} 
              />
            </Animated.View>
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

      {isSearchActive && (
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
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  header: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 8,
    paddingBottom: 8,
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
    backgroundColor: colors.lemon,
    borderWidth: 1,
    borderColor: colors.lemon,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: colors.lemon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    color: colors.darkBackground,
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
