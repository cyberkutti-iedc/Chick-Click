import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';


export default function About() {
  const insets = useSafeAreaInsets();
  
  // Sample team members data
  const teamMembers = [
    {
      name: 'James Aldrin D`cunja',
      role: 'Ideator Developer',
      image: require('../assets/images/team3.jpg')
    },
    {
      name: 'Muhammed Nadeer K N',
      role: 'Lead Developer',
      image: require('../assets/images/team1.jpg')
    },
    {
      name: 'Amrith Raj M M',
      role: 'UI/UX Developer',
      image: require('../assets/images/team2.jpg')
    }
  ];
  
  // Sample app features
  const appFeatures: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    title: string;
    description: string;
  }[] = [
    {
      icon: 'thermometer',
      title: 'Temperature Tracking',
      description: 'Monitors your device temperature in real-time to simulate egg incubation.'
    },
    {
      icon: 'egg-easter',
      title: 'Egg Hatching',
      description: 'Watch your egg transform based on temperature changes.'
    },
    {
      icon: 'history',
      title: 'Historical Data',
      description: 'View temperature trends and egg state history over time.'
    },
    {
      icon: 'cog',
      title: 'Customizable Settings',
      description: 'Adjust temperature thresholds and tracking intervals.'
    }
  ];
  
  return (
    <LinearGradient 
      colors={['#3a1c71', '#d76d77', '#ffaf7b']} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top || 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>About ChickClick</Text>
        
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.paragraph}>
            ChickClick is a fun and educational app that simulates egg incubation based on your device's temperature. 
            Our mission is to provide an engaging way to learn about temperature monitoring while enjoying a 
            virtual pet experience.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          {appFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <MaterialCommunityIcons name={feature.icon} size={24} color="#fff" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <Text style={styles.paragraph}>
            ChickClick uses your device's battery information to estimate temperature. As temperature rises, 
            your egg progresses toward hatching. If it gets too hot, beware - your egg might turn into an omelet!
          </Text>
          <Text style={styles.paragraph}>
            You can also set manual temperatures in Settings to experiment with different scenarios.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          <View style={styles.teamContainer}>
            {teamMembers.map((member, index) => (
              <View key={index} style={styles.teamMember}>
                <Image source={member.image} style={styles.memberImage} />
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Version Information</Text>
          <View style={styles.versionItem}>
            <Text style={styles.versionLabel}>App Version:</Text>
            <Text style={styles.versionValue}>1.0.0</Text>
          </View>
          <View style={styles.versionItem}>
            <Text style={styles.versionLabel}>Last Updated:</Text>
            <Text style={styles.versionValue}>March 30, 2025</Text>
          </View>
          <View style={styles.versionItem}>
            <Text style={styles.versionLabel}>Platform:</Text>
            <Text style={styles.versionValue}>React Native Expo</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect With Us</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://twitter.com/')}
            >
              <MaterialCommunityIcons name="twitter" size={24} color="#fff" />
              <Text style={styles.socialButtonText}>Twitter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://instagram.com/amruth__raj')}
            >
              <MaterialCommunityIcons name="instagram" size={24} color="#fff" />
              <Text style={styles.socialButtonText}>Instagram</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('mailto:ecoceeteam@gmail.com')}
            >
              <MaterialCommunityIcons name="email" size={24} color="#fff" />
              <Text style={styles.socialButtonText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.footerContainer}>
  <Link href="/" asChild>
    <TouchableOpacity style={styles.homeButton}>
      <MaterialCommunityIcons name="home" size={20} color="#fff" />
      <Text style={styles.homeButtonText}>Return to Home</Text>
    </TouchableOpacity>
  </Link>
  
  <Text style={styles.copyright}>© 2025 ChickClick. All rights reserved.</Text>
  
  <View style={styles.developerContainer}>
    <Text style={styles.developerText}>Developed by:</Text>
    <TouchableOpacity 
      style={styles.githubLink}
      onPress={() => Linking.openURL('https://github.com/cyberkutti-iedc')}
    >
      <MaterialCommunityIcons name="github" size={18} color="#fff" />
      <Text style={styles.githubLinkText}>@cyberkutti-iedc</Text>
    </TouchableOpacity>
  </View>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  paragraph: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  teamContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  teamMember: {
    alignItems: 'center',
    marginBottom: 15,
    width: '30%',
  },
  memberImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 8,
  },
  memberName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  memberRole: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  versionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  versionLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  versionValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  socialButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 15,
  },
  homeButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  developerContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  developerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  githubLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  githubLinkText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
});