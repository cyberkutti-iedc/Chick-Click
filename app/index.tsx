import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Animated,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Battery from 'expo-battery';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { APP_CONSTANTS } from '../lib/constant';

//const screenWidth = Dimensions.get('window').width;

export default function Index() {
  const [temperature, setTemperature] = useState(21);
  const [eggState, setEggState] = useState('egg');
  const [hatchProgress, setHatchProgress] = useState(0);
  const [timeToHatch, setTimeToHatch] = useState<number | null>(null);
  const [eggHatchingTemp, setEggHatchingTemp] = useState(APP_CONSTANTS.EGG_HATCHING_TEMP);
  const [eggCoolingTemp, setEggCoolingTemp] = useState(APP_CONSTANTS.EGG_COOLING_TEMP);
  const [omeletTemp, setOmeletTemp] = useState(APP_CONSTANTS.OMELET_TEMP);
  const [trackingInterval, setTrackingInterval] = useState(APP_CONSTANTS.TRACKING_INTERVAL);
  const [manualModeEnabled, setManualModeEnabled] = useState(false);
  const [manualTemperature, setManualTemperature] = useState(25);
  const [, setIsDarkMode] = useState(false);
  
  const eggAnimation = useRef(new Animated.Value(1)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  // First render animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(eggAnimation, { 
        toValue: 1.2, 
        duration: 300, 
        useNativeDriver: true 
      }),
      Animated.timing(eggAnimation, { 
        toValue: 0.9, 
        duration: 200, 
        useNativeDriver: true 
      }),
      Animated.timing(eggAnimation, { 
        toValue: 1, 
        duration: 200, 
        useNativeDriver: true 
      })
    ]).start();
  }, []);

  // Load settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedCoolingTemp = await AsyncStorage.getItem('eggCoolingTemp');
        if (savedCoolingTemp) setEggCoolingTemp(parseFloat(savedCoolingTemp));
        
        const savedHatchingTemp = await AsyncStorage.getItem('eggHatchingTemp');
        if (savedHatchingTemp) setEggHatchingTemp(parseFloat(savedHatchingTemp));
        
        const savedOmeletTemp = await AsyncStorage.getItem('omeletTemp');
        if (savedOmeletTemp) setOmeletTemp(parseFloat(savedOmeletTemp));
        
        const savedTrackingInterval = await AsyncStorage.getItem('trackingInterval');
        if (savedTrackingInterval) setTrackingInterval(parseFloat(savedTrackingInterval) * 1000); // Convert seconds to ms
        
        const savedManualMode = await AsyncStorage.getItem('manualModeEnabled');
        if (savedManualMode) setManualModeEnabled(savedManualMode === 'true');
        
        const savedManualTemp = await AsyncStorage.getItem('manualTemperature');
        if (savedManualTemp) setManualTemperature(parseFloat(savedManualTemp));
        
        const darkModeSetting = await AsyncStorage.getItem('darkModeEnabled');
        if (darkModeSetting) setIsDarkMode(darkModeSetting === 'true');
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    
    loadSettings();
    
    // Setting listeners - this will refresh settings when returning to this screen
    const focusHandler = () => {
      loadSettings();
    };
    
    // Simulate focus event by setting up a timer
    // In a real app, you would use a navigation lifecycle event
    const refreshTimer = setInterval(focusHandler, 10000);
    
    return () => {
      clearInterval(refreshTimer);
    };
  }, []);

  // Temperature tracking effect
  useEffect(() => {
    const fetchBatteryTemp = async () => {
      try {
        // If manual mode is enabled, use the manual temperature
        if (manualModeEnabled) {
          setTemperature(manualTemperature);
          updateEggState(manualTemperature);
          
          // Save temperature record to AsyncStorage
          saveTemperatureRecord(manualTemperature);
          return;
        }
        
        // Otherwise get battery temperature
        const batteryLevel = await Battery.getBatteryLevelAsync();
        const simulatedTemp = 20 + (batteryLevel * 30);
        const tempValue = Number(simulatedTemp.toFixed(1));
        
        setTemperature(tempValue);
        updateEggState(tempValue);
        
        // Save temperature record to AsyncStorage
        saveTemperatureRecord(tempValue);
      } catch (error) {
        console.error('Failed to get battery info:', error);
        const randomTemp = (Math.random() * 30 + 20).toFixed(1);
        const tempValue = Number(randomTemp);
        
        setTemperature(tempValue);
        updateEggState(tempValue);
        
        // Save temperature record to AsyncStorage
        saveTemperatureRecord(tempValue);
      }
    };

    // Initial fetch
    fetchBatteryTemp();
    
    // Set interval for regular updates
    const intervalId = setInterval(fetchBatteryTemp, trackingInterval);
    
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [manualModeEnabled, manualTemperature, eggHatchingTemp, eggCoolingTemp, omeletTemp, trackingInterval]);

  // Save temperature data for history tracking
  const saveTemperatureRecord = async (temp: number) => {
    try {
      // Get existing records
      const existingRecordsJson = await AsyncStorage.getItem('temperatureHistory');
      let records = existingRecordsJson ? JSON.parse(existingRecordsJson) : [];
      
      // Add new record
      records.push({
        temperature: temp,
        timestamp: new Date().toISOString(),
        eggState: getEggStateFromTemp(temp)
      });
      
      // Keep only the last 100 records to prevent storage bloat
      if (records.length > 100) {
        records = records.slice(records.length - 100);
      }
      
      // Save back to storage
      await AsyncStorage.setItem('temperatureHistory', JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save temperature record:', error);
    }
  };

  // Update egg state based on temperature
  const updateEggState = (temp: number) => {
    // Calculate hatch progress
    const progress = temp < eggHatchingTemp 
      ? Math.min((temp - eggCoolingTemp) / (eggHatchingTemp - eggCoolingTemp), 1) * 100
      : 100;
    
    setHatchProgress(progress);
    
    // Calculate time to hatch (if not yet hatched)
    if (temp < eggHatchingTemp) {
      const degreesUntilHatch = eggHatchingTemp - temp;
      const timeInSeconds = degreesUntilHatch * 60; // Assuming 1 degree per minute
      setTimeToHatch(timeInSeconds);
    } else {
      setTimeToHatch(0);
    }
    
    // Update egg state and animations
    const newEggState = getEggStateFromTemp(temp);
    
    // Only update animations if the egg state changes
    if (newEggState !== eggState) {
      setEggState(newEggState);
      
      // Reset existing animations
      eggAnimation.stopAnimation();
      shakeAnimation.stopAnimation();
      rotateAnimation.stopAnimation();
      
      // Apply different animations based on egg state
      if (newEggState === 'egg') {
        // Gentle pulsing animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(eggAnimation, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
            Animated.timing(eggAnimation, { toValue: 0.95, duration: 1500, useNativeDriver: true })
          ])
        ).start();
        
        // Reset other animations
        shakeAnimation.setValue(0);
        rotateAnimation.setValue(0);
      } 
      else if (newEggState === 'chicken') {
        // Hatching animation: shake and rotate
        Animated.loop(
          Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 5, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -5, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
            Animated.delay(500)
          ]), { iterations: 3 }
        ).start();
        
        // Also add slight rotation for more dynamic effect
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnimation, { toValue: 0.05, duration: 300, useNativeDriver: true }),
            Animated.timing(rotateAnimation, { toValue: -0.05, duration: 300, useNativeDriver: true }),
            Animated.timing(rotateAnimation, { toValue: 0, duration: 300, useNativeDriver: true })
          ])
        ).start();
      } 
      else if (newEggState === 'omelet') {
        // Omelet melting/sizzling animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(eggAnimation, { toValue: 1.1, duration: 200, useNativeDriver: true }),
            Animated.timing(eggAnimation, { toValue: 0.9, duration: 200, useNativeDriver: true })
          ])
        ).start();
        
        // Also add continuous rotation for cooking effect
        Animated.loop(
          Animated.timing(rotateAnimation, { 
            toValue: 1, 
            duration: 5000, 
            useNativeDriver: true 
          })
        ).start();
      }
    }
  };

  // Helper function to determine egg state from temperature
  const getEggStateFromTemp = (temp: number) => {
    if (temp < eggHatchingTemp) {
      return 'egg';
    } else if (temp >= eggHatchingTemp && temp < omeletTemp) {
      return 'chicken';
    } else {
      return 'omelet';
    }
  };

  // Get the appropriate egg image based on state
  const getEggImage = () => {
    switch (eggState) {
      case 'chicken': return require('../assets/images/chicken.gif');
      case 'omelet': return require('../assets/images/omelet.gif');
      default: return require('../assets/images/egg.gif');
    }
  };

  // Format time in minutes and seconds
  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    if (seconds <= 0) return 'Hatched!';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get background gradient colors based on temperature
  const getGradientColors = () => {
    if (temperature < eggCoolingTemp) {
      return ['#a1c4fd', '#c2e9fb'] as const; // Cool blue
    } else if (temperature < eggHatchingTemp) {
      return ['#f6d365', '#fda085'] as const; // Warm yellow to orange
    } else if (temperature < omeletTemp) {
      return ['#fda085', '#f5576c'] as const; // Orange to warm red
    } else {
      return ['#f5576c', '#833ab4'] as const; // Hot red to purple
    }
  };

  // Get temperature status text
  const getTemperatureStatus = () => {
    if (temperature < eggCoolingTemp) {
      return 'Too cold!';
    } else if (temperature < eggHatchingTemp) {
      return 'Warming up...';
    } else if (temperature < omeletTemp) {
      return 'Perfect hatching temperature!';
    } else {
      return 'Too hot! Careful!';
    }
  };

  // Handle manual temperature change
  const handleManualTemperatureToggle = async () => {
    if (!manualModeEnabled) {
      // If going from disabled to enabled, show message about settings
      Alert.alert(
        'Manual Mode',
        'Manual temperature mode enabled. You can adjust the temperature in Settings.',
        [{ text: 'OK' }]
      );
    }
    
    // Toggle the mode
    const newMode = !manualModeEnabled;
    setManualModeEnabled(newMode);
    await AsyncStorage.setItem('manualModeEnabled', newMode.toString());
  };

  // Create spin transform based on rotation animation
  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient colors={getGradientColors()} style={styles.container}>
      <SafeAreaView style={styles.safeContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>ChickClick</Text>
          <Text style={styles.subtitle}>Egg-citing Temperature Tracker</Text>

          {/* Manual Mode Indicator */}
          {manualModeEnabled && (
            <View style={styles.manualModeContainer}>
              <MaterialCommunityIcons name="hand-pointing-up" size={20} color="#fff" />
              <Text style={styles.manualModeText}>Manual Mode Active</Text>
              <TouchableOpacity onPress={handleManualTemperatureToggle}>
                <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Temperature Display */}
          <View style={styles.tempContainer}>
            <Text style={styles.tempText}>{temperature.toFixed(1)}°C</Text>
            <TouchableOpacity onPress={handleManualTemperatureToggle}>
              <MaterialCommunityIcons 
                name={manualModeEnabled ? "thermometer-lines" : "thermometer"} 
                size={28} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.statusText}>{getTemperatureStatus()}</Text>

          {/* Egg Container with Animations */}
          <View style={styles.eggContainer}>
            <Animated.View 
              style={{ 
                transform: [
                  { scale: eggAnimation },
                  { translateX: shakeAnimation },
                  { rotate: spin }
                ] 
              }}
            >
              <Image source={getEggImage()} style={styles.eggImage} resizeMode="cover" />
            </Animated.View>
          </View>
          
          {/* Egg Status Information */}
          <View style={styles.infoContainer}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Egg State</Text>
              <Text style={styles.infoValue}>{eggState.charAt(0).toUpperCase() + eggState.slice(1)}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Hatch Progress</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${hatchProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{hatchProgress.toFixed(1)}%</Text>
            </View>
            
            {timeToHatch !== null && eggState === 'egg' && (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Est. Time to Hatch</Text>
                <Text style={styles.infoValue}>{formatTime(timeToHatch)}</Text>
              </View>
            )}
          </View>
          
          {/* Temperature Thresholds Information */}
          <View style={styles.thresholdsContainer}>
            <Text style={styles.thresholdTitle}>Temperature Thresholds</Text>
            <View style={styles.thresholdRow}>
              <MaterialCommunityIcons name="snowflake" size={18} color="#fff" />
              <Text style={styles.thresholdText}>Cooling: {eggCoolingTemp}°C</Text>
            </View>
            <View style={styles.thresholdRow}>
              <MaterialCommunityIcons name="egg-easter" size={18} color="#fff" />
              <Text style={styles.thresholdText}>Hatching: {eggHatchingTemp}°C</Text>
            </View>
            <View style={styles.thresholdRow}>
              <MaterialCommunityIcons name="fire" size={18} color="#fff" />
              <Text style={styles.thresholdText}>Omelet: {omeletTemp}°C</Text>
            </View>
          </View>
          
          {/* Tip Card */}
          <View style={styles.tipCard}>
            <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FFD700" />
            <Text style={styles.tipText}>
              Tip: {eggState === 'egg' 
                ? 'Keep the temperature between 20-25°C for optimal hatching!' 
                : eggState === 'chicken' 
                  ? 'Congratulations! Keep temperature stable to make your chicken happy.' 
                  : 'Oh no! Cool down your device to save your egg!'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  safeContainer: { 
    flex: 1 
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16
  },
  manualModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 10
  },
  manualModeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    marginRight: 8
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  subtitle: { 
    fontSize: 18, 
    color: '#fff', 
    marginBottom: 20,
    opacity: 0.9
  },
  tempContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 10 
  },
  tempText: { 
    fontSize: 50, 
    color: '#fff', 
    fontWeight: 'bold', 
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 5,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1
  },
  eggContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden'
  },
  eggImage: { 
    width: 250, 
    height: 250, 
    borderRadius: 20 
  },
  infoContainer: {
    width: '100%',
    marginVertical: 10
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    alignItems: 'center'
  },
  infoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6
  },
  infoValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  progressBarContainer: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 8
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 6
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  thresholdsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10
  },
  thresholdTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5
  },
  thresholdText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10
  },
  tipCard: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  tipText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    flex: 1
  }
});