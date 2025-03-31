import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
//import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';

interface HistoryItem {
  timestamp: string;
  temperature: number;
  eggState: 'chicken' | 'omelet' | 'egg';
}

// Define the task handler
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Fetch the current temperature (simulated here)
    const temperature = await simulateTemperatureReading();
    
    // Load thresholds from storage
    const eggCoolingTemp = parseFloat(await AsyncStorage.getItem('eggCoolingTemp') || '25');
    const eggHatchingTemp = parseFloat(await AsyncStorage.getItem('eggHatchingTemp') || '35');
    const omeletTemp = parseFloat(await AsyncStorage.getItem('omeletTemp') || '45');
    
    // Determine egg state based on temperature and thresholds
    let eggState: 'chicken' | 'omelet' | 'egg' = 'egg';
    if (temperature < eggCoolingTemp) {
      eggState = 'egg';
    } else if (temperature >= eggHatchingTemp && temperature < omeletTemp) {
      eggState = 'chicken';
    } else if (temperature >= omeletTemp) {
      eggState = 'omelet';
    }
    
    // Add to temperature history
    const historyItem: HistoryItem = {
      timestamp: new Date().toISOString(),
      temperature,
      eggState
    };
    
    // Load existing history
    const historyJson = await AsyncStorage.getItem('temperatureHistory');
    let history: HistoryItem[] = [];
    
    if (historyJson) {
      history = JSON.parse(historyJson);
    }
    
    // Add new reading and limit to 100 entries to prevent excessive storage use
    history.push(historyItem);
    if (history.length > 100) {
      history = history.slice(-100);
    }
    
    // Save updated history
    await AsyncStorage.setItem('temperatureHistory', JSON.stringify(history));
    
    // Return success to keep the background fetch active
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Function to simulate temperature reading (replace with actual sensor reading if available)
const simulateTemperatureReading = async (): Promise<number> => {
  // Check if manual mode is enabled
  const getManualTemp = async () => {
    const manualModeEnabled = await AsyncStorage.getItem('manualModeEnabled');
    if (manualModeEnabled === 'true') {
      const manualTemp = await AsyncStorage.getItem('manualTemperature');
      if (manualTemp) {
        return parseFloat(manualTemp);
      }
    }
    return null;
  };
  
  // If manual mode enabled, use that temperature
  const manualTemp = await getManualTemp();
  if (manualTemp !== null) {
    return manualTemp;
  }
  
  // Otherwise generate a random temperature between 5 and 45°C
  // This is just a placeholder for actual device temperature sensing
  return Math.round((5 + Math.random() * 40) * 10) / 10;
};

// Register the background fetch task
export const registerBackgroundFetch = async () => {
  try {
    // Check if the device supports background fetch
    const status = await BackgroundFetch.getStatusAsync();
    
    if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
      // Register the task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15 * 60, // 15 minutes in seconds
        stopOnTerminate: false,
        startOnBoot: true,
      });
      
      console.log('Background fetch task registered successfully');
      return true;
    } else {
      console.log('Background fetch is not available on this device');
      return false;
    }
  } catch (error) {
    console.error('Failed to register background fetch:', error);
    return false;
  }
};

// Unregister the background fetch task
export const unregisterBackgroundFetch = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('Background fetch task unregistered successfully');
    return true;
  } catch (error) {
    console.error('Failed to unregister background fetch:', error);
    return false;
  }
};

// Check background fetch status
export const checkBackgroundFetchStatus = async () => {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    
    return {
      status,
      isRegistered,
      isAvailable: status === BackgroundFetch.BackgroundFetchStatus.Available
    };
  } catch (error) {
    console.error('Failed to check background fetch status:', error);
    return {
      status: BackgroundFetch.BackgroundFetchStatus.Denied,
      isRegistered: false,
      isAvailable: false
    };
  }
};

// This default export is necessary to fix the warning
export default {
  registerBackgroundFetch,
  unregisterBackgroundFetch,
  checkBackgroundFetchStatus
};