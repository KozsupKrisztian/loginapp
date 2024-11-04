import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { initializeApp } from '@firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from '@firebase/auth';
import { ImageBackground } from 'react-native';
import { Image } from 'react-native';
import backgroundImage from './images/bg.jpg';
import logoImage from './images/logo.jpg';

const firebaseConfig = {
  apiKey: "AIzaSyBnE18Z93oLyVI8DbYhR2--1-v_tYyCsAQ",
  authDomain: "loginapp-kk.firebaseapp.com",
  projectId: "loginapp-kk",
  storageBucket: "loginapp-kk.firebasestorage.app",
  messagingSenderId: "714527906588",
  appId: "1:714527906588:web:493d75338a69fa36ccf8d9"
};

const app = initializeApp(firebaseConfig);

const AuthScreen = ({ email, setEmail, password, setPassword, isLogin, setIsLogin, handleAuthentication }) => {
  return (
    <View style={styles.authContainer}>
      <Text style={styles.title}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleAuthentication}>
        <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <Text style={styles.toggleText} onPress={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
      </Text>
    </View>
  );
};

const AuthenticatedScreen = ({ user, handleAuthentication }) => {
  return (
    <View style={styles.authContainer}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.emailText}>{user.email}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleAuthentication}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null); 
  const [isAlertVisible, setIsAlertVisible] = useState(false); // Alert állapot kezelése

  const auth = getAuth(app);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleAuthentication = async () => {
    try {
      if (user) {
        await signOut(auth);
      } else {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
      }
    } catch (error) {
      console.log('Authentication error:', error.message);
      setError(error.message); // Hibaüzenet beállítása
      setIsAlertVisible(true); // Alert megjelenítése
    }
  };

  const closeAlert = () => {
    setIsAlertVisible(false); // Alert bezárása
    setError(null); // Hibaüzenet törlése
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={logoImage} style={styles.logo} />
        {user ? (
          <AuthenticatedScreen user={user} handleAuthentication={handleAuthentication} />
        ) : (
          <AuthScreen
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLogin={isLogin}
            setIsLogin={setIsLogin}
            handleAuthentication={handleAuthentication}
          />
        )}
      </ScrollView>

      {/* Custom Alert Modal */}
      <Modal
        transparent={true}
        visible={isAlertVisible}
        animationType="slide"
      >
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertMessage}>{error}</Text>
            <TouchableOpacity style={styles.alertButton} onPress={closeAlert}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  authContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f1f2f6',
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  toggleText: {
    color: '#3498db',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  emailText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333333',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 8,
  },
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Átlátszó fekete háttér
  },
  alertBox: {
    width: 300,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  alertMessage: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  alertButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    borderRadius: 5,
  },
});
