import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, FlatList } from 'react-native';
import { initializeApp } from '@firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, deleteUser } from '@firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from '@firebase/firestore';
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
const auth = getAuth(app);
const firestore = getFirestore(app);

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

const AuthenticatedScreen = ({ user, handleLogout, handleDeleteAccount }) => {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const userId = user.uid;

  // Fetch user notes on component mount
  const fetchNotes = async () => {
    const q = query(collection(firestore, 'notes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const notesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setNotes(notesData);
  };

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  // Add a new note to Firestore
  const handleAddNote = async () => {
    if (note.trim()) {
      await addDoc(collection(firestore, 'notes'), { text: note, userId });
      setNote(''); // Clear the input field
      fetchNotes(); // Refresh the notes list
    }
  };

  const handleDeleteNote = async (noteId) => {
    await deleteDoc(doc(firestore, 'notes', noteId));
    fetchNotes(); // Refresh the notes list after deletion
  };

  // Delete account and associated notes
  const deleteAccount = async () => {
    try {
      const userRef = auth.currentUser;
      const q = query(collection(firestore, 'notes'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      // Delete each note from Firestore
      await Promise.all(querySnapshot.docs.map((noteDoc) => deleteDoc(doc(firestore, 'notes', noteDoc.id))));

      // Delete user account
      await deleteUser(userRef);
    } catch (error) {
      console.log('Error deleting account:', error);
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.title}>Welcome, {user.email}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter a note"
        value={note}
        onChangeText={setNote}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddNote}>
        <Text style={styles.buttonText}>Save Note</Text>
      </TouchableOpacity>

      <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
      <View style={styles.noteContainer}>
          <Text style={styles.noteText}>{item.text}</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteNote(item.id)}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
  )}
/>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteAccountButton} onPress={deleteAccount}>
        <Text style={styles.buttonText}>Delete Account</Text>
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
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthentication = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.log('Authentication error:', error.message);
      setError(error.message);
      setIsAlertVisible(true);
    }
  };

  const closeAlert = () => {
    setIsAlertVisible(false);
    setError(null);
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={logoImage} style={styles.logo} />
        {user ? (
          <AuthenticatedScreen 
            user={user} 
            handleLogout={() => signOut(auth)} 
            handleDeleteAccount={() => deleteAccount(auth)} 
          />
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
      <Modal transparent={true} visible={isAlertVisible} animationType="slide">
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
};
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
    marginBottom: 16,
  },
  deleteAccountButton: {
    backgroundColor: '#c0392b',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  noteContainer: {
    backgroundColor: '#f1f2f6',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  noteText: {
    fontSize: 16,
    color: '#333',
  },

  deleteText: {
    color: '#e74c3c',  // Red color for visibility
    fontSize: 16,
    marginTop: 5,
    textAlign: 'right',  // Align text to the right
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
