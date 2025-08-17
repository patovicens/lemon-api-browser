import React, { useState, useEffect } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

interface LastUpdatedProps {
  lastFetchTime?: Date;
  style?: StyleProp<TextStyle>;
}

const LastUpdated: React.FC<LastUpdatedProps> = ({ lastFetchTime, style }) => {
  const [displayText, setDisplayText] = useState<string>('');

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
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
  };

  useEffect(() => {
    if (!lastFetchTime) {
      setDisplayText('Never updated');
      return;
    }

    setDisplayText(`Last updated: ${getTimeAgo(lastFetchTime)}`);

    const interval = setInterval(() => {
      setDisplayText(`Last updated: ${getTimeAgo(lastFetchTime)}`);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastFetchTime]);

  return <Text style={style}>{displayText}</Text>;
};

export default LastUpdated;