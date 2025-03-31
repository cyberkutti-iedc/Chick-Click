import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONSTANTS } from '../lib/constant';
// In settings.tsx, replace:
import { registerBackgroundFetch, unregisterBackgroundFetch, checkBackgroundFetchStatus } from '../lib/backgroundService';

export default function Settings() {
  const insets = useSafeAreaInsets();
  
  // State for temperature thresholds
  const [eggCoolingTemp, setEggCoolingTemp] = useState(APP_CONSTANTS.EGG_COOLING_TEMP.toString());
  const [eggHatchingTemp, setEggHatchingTemp] = useState(APP_CONSTANTS.EGG_HATCHING_TEMP.toString());
  const [omeletTemp, setOmeletTemp] = useState(APP_CONSTANTS.OMELET_TEMP.toString());
  
  // State for tracking interval (in seconds for user-friendly display)
  const [trackingInterval, setTrackingInterval] = useState((APP_CONSTANTS.TRACKING_INTERVAL / 1000).toString());
  
  // State for additional settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [manualModeEnabled, setManualModeEnabled] = useState(false);
  const [manualTemperature, setManualTemperature] = useState('25');
  const [backgroundTrackingEnabled, setBackgroundTrackingEnabled] = useState<boolean>(false);
  const [backgroundStatus, setBackgroundStatus] = useState<string>('Unknown');

  const toggleBackgroundTracking = async (value: boolean) => {
    try {
      if (value) {
        await registerBackgroundFetch();
        const status = await checkBackgroundFetchStatus();
        
        if (status.isRegistered) {
          setBackgroundStatus('Active');
        } else {
          setBackgroundStatus('Failed to register');
          Alert.alert(
            'Background Task Issue',
            'The background task could not be registered. This might be due to system limitations.',
            [{ text: 'OK' }]
          );
          value = false;
        }
      } else {
        await unregisterBackgroundFetch();
        setBackgroundStatus('Disabled');
      }
      
      setBackgroundTrackingEnabled(value);
      await AsyncStorage.setItem('backgroundTrackingEnabled', value.toString());
    } catch (error) {
      console.error('Failed to toggle background tracking:', error);
      Alert.alert('Error', 'Failed to toggle background tracking. Please try again.');
    }
  };
  
  // Load saved settings
  useEffect(() => {
    loadSettings();
    
    // Check background service status on mount
    const checkStatus = async () => {
      try {
        const status = await checkBackgroundFetchStatus();
        if (status.isRegistered) {
          setBackgroundStatus('Active');
        } else {
          setBackgroundStatus('Disabled');
        }
      } catch (error) {
        console.error('Failed to check background status:', error);
        setBackgroundStatus('Unknown');
      }
    };
    
    checkStatus();
  }, []);
  
  const loadSettings = async () => {
    try {
      // Load threshold settings
      const savedCoolingTemp = await AsyncStorage.getItem('eggCoolingTemp');
      if (savedCoolingTemp) setEggCoolingTemp(savedCoolingTemp);
      
      const savedHatchingTemp = await AsyncStorage.getItem('eggHatchingTemp');
      if (savedHatchingTemp) setEggHatchingTemp(savedHatchingTemp);
      
      const savedOmeletTemp = await AsyncStorage.getItem('omeletTemp');
      if (savedOmeletTemp) setOmeletTemp(savedOmeletTemp);
      
      const savedTrackingInterval = await AsyncStorage.getItem('trackingInterval');
      if (savedTrackingInterval) setTrackingInterval(savedTrackingInterval);
      
      // Load additional settings
      const savedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      if (savedNotifications) setNotificationsEnabled(savedNotifications === 'true');
      
      const savedDarkMode = await AsyncStorage.getItem('darkModeEnabled');
      if (savedDarkMode) setDarkModeEnabled(savedDarkMode === 'true');
      
      const savedManualMode = await AsyncStorage.getItem('manualModeEnabled');
      if (savedManualMode) setManualModeEnabled(savedManualMode === 'true');
      
      const savedManualTemp = await AsyncStorage.getItem('manualTemperature');
      if (savedManualTemp) setManualTemperature(savedManualTemp);
      
      const savedBackgroundTracking = await AsyncStorage.getItem('backgroundTrackingEnabled');
      if (savedBackgroundTracking) setBackgroundTrackingEnabled(savedBackgroundTracking === 'true');
      
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };
  
  const saveSettings = async () => {
    try {
      // Validate inputs
      const coolingValue = parseFloat(eggCoolingTemp);
      const hatchingValue = parseFloat(eggHatchingTemp);
      const omeletValue = parseFloat(omeletTemp);
      const intervalValue = parseFloat(trackingInterval);
      const manualTempValue = parseFloat(manualTemperature);
      
      if (isNaN(coolingValue) || isNaN(hatchingValue) || isNaN(omeletValue) || isNaN(intervalValue) || isNaN(manualTempValue)) {
        Alert.alert('Invalid Input', 'Please enter valid numbers for all temperature and interval values.');
        return;
      }
      
      if (coolingValue >= hatchingValue) {
        Alert.alert('Invalid Temperature Range', 'Cooling temperature must be less than hatching temperature.');
        return;
      }
      
      if (hatchingValue >= omeletValue) {
        Alert.alert('Invalid Temperature Range', 'Hatching temperature must be less than omelet temperature.');
        return;
      }
      
      if (intervalValue < 1 || intervalValue > 60) {
        Alert.alert('Invalid Interval', 'Tracking interval must be between 1 and 60 seconds.');
        return;
      }
      
      // Save threshold settings
      await AsyncStorage.setItem('eggCoolingTemp', eggCoolingTemp);
      await AsyncStorage.setItem('eggHatchingTemp', eggHatchingTemp);
      await AsyncStorage.setItem('omeletTemp', omeletTemp);
      await AsyncStorage.setItem('trackingInterval', trackingInterval);
      
      // Save additional settings
      await AsyncStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
      await AsyncStorage.setItem('darkModeEnabled', darkModeEnabled.toString());
      await AsyncStorage.setItem('manualModeEnabled', manualModeEnabled.toString());
      await AsyncStorage.setItem('manualTemperature', manualTemperature);
      await AsyncStorage.setItem('backgroundTrackingEnabled', backgroundTrackingEnabled.toString());
      
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };
  
  const resetDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all settings to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          onPress: async () => {
            setEggCoolingTemp(APP_CONSTANTS.EGG_COOLING_TEMP.toString());
            setEggHatchingTemp(APP_CONSTANTS.EGG_HATCHING_TEMP.toString());
            setOmeletTemp(APP_CONSTANTS.OMELET_TEMP.toString());
            setTrackingInterval((APP_CONSTANTS.TRACKING_INTERVAL / 1000).toString());
            setNotificationsEnabled(false);
            setDarkModeEnabled(false);
            setManualModeEnabled(false);
            setManualTemperature('25');
            
            // Handle background tracking separately
            if (backgroundTrackingEnabled) {
              await unregisterBackgroundFetch();
              setBackgroundTrackingEnabled(false);
              setBackgroundStatus('Disabled');
              await AsyncStorage.setItem('backgroundTrackingEnabled', 'false');
            }
          }
        }
      ]
    );
  };
  
  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all app data including temperature history? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Unregister background task before clearing all data
              if (backgroundTrackingEnabled) {
                await unregisterBackgroundFetch();
                setBackgroundTrackingEnabled(false);
                setBackgroundStatus('Disabled');
              }
              
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared.');
              loadSettings(); // Reload default settings
            } catch (error) {
              console.error('Failed to clear data:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  return (
    <LinearGradient 
      colors={['#6a11cb', '#2575fc']}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top || 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Settings</Text>
        
        {/* Temperature Thresholds */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons name="thermometer" size={20} color="#fff" />
            {' Temperature Thresholds'}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cooling Temperature (°C):</Text>
            <TextInput
              style={styles.input}
              value={eggCoolingTemp}
              onChangeText={setEggCoolingTemp}
              keyboardType="numeric"
              placeholder="Enter temperature"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Hatching Temperature (°C):</Text>
            <TextInput
              style={styles.input}
              value={eggHatchingTemp}
              onChangeText={setEggHatchingTemp}
              keyboardType="numeric"
              placeholder="Enter temperature"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Omelet Temperature (°C):</Text>
            <TextInput
              style={styles.input}
              value={omeletTemp}
              onChangeText={setOmeletTemp}
              keyboardType="numeric"
              placeholder="Enter temperature"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>
        </View>
        
        {/* Tracking Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons name="timer-outline" size={20} color="#fff" />
            {' Tracking Settings'}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Update Interval (seconds):</Text>
            <TextInput
              style={styles.input}
              value={trackingInterval}
              onChangeText={setTrackingInterval}
              keyboardType="numeric"
              placeholder="Enter interval"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Manual Temperature Mode:</Text>
            <Switch
              value={manualModeEnabled}
              onValueChange={setManualModeEnabled}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={manualModeEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          {manualModeEnabled && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Manual Temperature (°C):</Text>
              <TextInput
                style={styles.input}
                value={manualTemperature}
                onChangeText={setManualTemperature}
                keyboardType="numeric"
                placeholder="Enter temperature"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>
          )}
        </View>
        
        {/* Background Processing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#fff" />
            {' Background Processing'}
          </Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Enable Background Tracking:</Text>
            <Switch
              value={backgroundTrackingEnabled}
              onValueChange={toggleBackgroundTracking}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={backgroundTrackingEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[
              styles.statusValue, 
              { 
                color: backgroundStatus === 'Active' 
                  ? '#4CAF50' 
                  : backgroundStatus === 'Disabled' 
                    ? '#FFA500' 
                    : '#F44336' 
              }
            ]}>
              {backgroundStatus}
            </Text>
          </View>
          
          {backgroundTrackingEnabled && (
            <Text style={styles.infoText}>
              Temperature will be monitored approximately every 15 minutes even when the app is closed.
              This may affect battery life.
            </Text>
          )}
          
          {Platform.OS === 'ios' && backgroundTrackingEnabled && (
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => Linking.openSettings()}
            >
              <MaterialCommunityIcons name="help-circle" size={16} color="#fff" />
              <Text style={styles.helpButtonText}>
                On iOS, background operations may be limited. Open Settings to configure background app refresh.
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <MaterialCommunityIcons name="cog-outline" size={20} color="#fff" />
            {' App Settings'}
          </Text>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Enable Notifications:</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notificationsEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Dark Mode:</Text>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={darkModeEnabled ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
            <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
            <Text style={styles.buttonText}>Save Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resetButton} onPress={resetDefaults}>
            <MaterialCommunityIcons name="restart" size={20} color="#fff" />
            <Text style={styles.buttonText}>Reset to Defaults</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.clearButton} onPress={clearAllData}>
            <MaterialCommunityIcons name="delete" size={20} color="#fff" />
            <Text style={styles.buttonText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
        
        {/* About Section */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About ChickClick</Text>
          <Text style={styles.aboutText}>
            ChickClick is an egg temperature tracker that simulates egg incubation based on your device temperature.
            Watch your egg hatch into a chicken or turn into an omelet depending on the temperature!
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 4
  },
  switchLabel: {
    color: '#fff',
    fontSize: 14,
    flex: 1
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusLabel: {
    color: '#fff',
    fontSize: 14,
    marginRight: 8,
  },
  statusValue: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 15,
    lineHeight: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: 12,
    borderRadius: 8
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    padding: 10,
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
    marginLeft: 8
  },
  buttonContainer: {
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  resetButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  clearButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  aboutSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  aboutText: {
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  }
});