import React, { useState, useEffect, useCallback } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

interface LastUpdatedProps {
  lastFetchTime?: Date;
  style?: StyleProp<TextStyle>;
}

const LastUpdated: React.FC<LastUpdatedProps> = ({ lastFetchTime, style }) => {
  const [displayText, setDisplayText] = useState<string>('');

  const getTimeAgo = useCallback((date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    
    if (diffInSeconds < 30) {
      return 'Just now';
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInMinutes === 1) {
      return '1 minute ago';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      if (hours === 1) {
        return '1 hour ago';
      } else if (hours < 24) {
        return `${hours} hours ago`;
      } else {
        const days = Math.floor(hours / 24);
        return days === 1 ? '1 day ago' : `${days} days ago`;
      }
    }
  }, []);

  useEffect(() => {
    if (!lastFetchTime) {
      setDisplayText('Never updated');
      return;
    }

    const updateDisplay = () => {
      setDisplayText(`Last updated: ${getTimeAgo(lastFetchTime)}`);
    };

    updateDisplay();

    const interval = setInterval(updateDisplay, 30000);

    return () => clearInterval(interval);
  }, [lastFetchTime, getTimeAgo]);

  return <Text style={style}>{displayText}</Text>;
};

export default LastUpdated;