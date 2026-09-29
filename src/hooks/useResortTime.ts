import { useState, useEffect } from 'react';

export interface ResortTimeInfo {
  timeString: string;
  period: 'morning' | 'afternoon' | 'sunset' | 'night';
  greeting: string;
  temperatureC: number;
  temperatureF: number;
  windKnots: number;
  tideState: string;
}

export function useResortTime(): ResortTimeInfo {
  const [timeInfo, setTimeInfo] = useState<ResortTimeInfo>(() => getMaldivesTime());

  function getMaldivesTime(): ResortTimeInfo {
    const now = new Date();
    // Maldives is UTC+5
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const maldivesDate = new Date(utc + 3600000 * 5);

    const hours = maldivesDate.getHours();
    const minutes = maldivesDate.getMinutes();
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;

    let period: 'morning' | 'afternoon' | 'sunset' | 'night' = 'afternoon';
    let greeting = 'Good afternoon from Velora';

    if (hours >= 5 && hours < 12) {
      period = 'morning';
      greeting = 'Good morning from Velora';
    } else if (hours >= 12 && hours < 17) {
      period = 'afternoon';
      greeting = 'Good afternoon from Velora';
    } else if (hours >= 17 && hours < 19) {
      period = 'sunset';
      greeting = 'The golden hour on Velora';
    } else {
      period = 'night';
      greeting = 'Good evening from Velora';
    }

    return {
      timeString: `${formattedHours}:${formattedMinutes}`,
      period,
      greeting,
      temperatureC: 29,
      temperatureF: 84,
      windKnots: 8,
      tideState: hours % 6 < 3 ? 'Gentle High Tide' : 'Calm Ebb Tide',
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(getMaldivesTime());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return timeInfo;
}
