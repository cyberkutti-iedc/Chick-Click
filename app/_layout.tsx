import React, { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {  registerBackgroundFetch } from '../lib/backgroundService';


export default function RootLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Initialize background process
  useEffect(() => {
    const initBackgroundProcessing = async () => {
      // Configure notifications
     // configureNotifications();
      
      // Check if background tracking is enabled
      const backgroundTrackingEnabled = await AsyncStorage.getItem('backgroundTrackingEnabled');
      if (backgroundTrackingEnabled === 'true') {
        registerBackgroundFetch();
      }
    };
    
    initBackgroundProcessing();
  }, []);
  
  // Load dark mode preference
  useEffect(() => {
    const loadDarkModeSetting = async () => {
      try {
        const darkModeSetting = await AsyncStorage.getItem('darkModeEnabled');
        if (darkModeSetting) {
          setIsDarkMode(darkModeSetting === 'true');
        }
      } catch (error) {
        console.error('Failed to load dark mode setting:', error);
      }
    };
    
    loadDarkModeSetting();
  }, []);
  
  // Get styles based on dark mode setting
  const getLightDarkStyle = () => {
    if (isDarkMode) {
      return {
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: '#1a1a1a',
          borderTopWidth: 1,
          borderTopColor: '#333',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        activeTintColor: '#fd7e14',
        inactiveTintColor: '#adb5bd',
        statusBarStyle: 'light' as 'light' | 'dark' | 'auto',
      };
    } else {
      return {
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e9ecef',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        activeTintColor: '#fd7e14',
        inactiveTintColor: '#6c757d',
        statusBarStyle: 'dark' as 'light' | 'dark' | 'auto',
      };
    }
  };
  
  const styleConfig = getLightDarkStyle();
  
  return (
    <SafeAreaProvider>
      <StatusBar style={styleConfig.statusBarStyle} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: styleConfig.activeTintColor,
          tabBarInactiveTintColor: styleConfig.inactiveTintColor,
          tabBarStyle: styleConfig.tabBarStyle,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="egg" size={size} color={color} />
            ),
            tabBarLabel: ({ color }) => (
              <Text style={{ color, fontSize: 12, marginTop: -5 }}>Home</Text>
            ),
          }}
        />
      {/*  <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="chart-line" size={size} color={color} />
            ),
            tabBarLabel: ({ color }) => (
              <Text style={{ color, fontSize: 12, marginTop: -5 }}>History</Text>
            ),
          }}
        />*/ }
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" size={size} color={color} />
            ),
            tabBarLabel: ({ color }) => (
              <Text style={{ color, fontSize: 12, marginTop: -5 }}>Settings</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            title: 'About',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="information" size={size} color={color} />
            ),
            tabBarLabel: ({ color }) => (
              <Text style={{ color, fontSize: 12, marginTop: -5 }}>About</Text>
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}