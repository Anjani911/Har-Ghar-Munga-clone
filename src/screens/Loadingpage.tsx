import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Image, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Animated } from 'react-native';


const SplashScreen = () => {
  const navigation = useNavigation();
  const [fadeAnim] = useState(new Animated.Value(1)); // fully visible
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Simulate any async task (fetching user, permissions, etc.)
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn('App loading failed:', e);
      } finally {
        setIsAppReady(true);
      }
    };

    prepareApp();
  }, []);

  useEffect(() => {
    if (isAppReady) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Home'); // Replace with actual screen
      });
    }
  }, [isAppReady]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.centerContainer}>
        <View style={styles.imageWrapper}>
          {/* Replace with your image later */}
          <Image
            source={require('../assets/logo_placeholder.png')} // Replace with your image path
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
      <Text style={styles.footerText}>Powered by SSIPMT</Text>
    </Animated.View>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2E7D32',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    padding: 10,
    alignSelf: 'center',
    elevation: 5,
  },
  image: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.6,
    borderRadius: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 20,
    fontStyle: 'italic',
  },
});

export default SplashScreen;
