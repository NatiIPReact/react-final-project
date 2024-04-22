import { StyleSheet, Text, View, Button, FlatList, TextInput, TouchableOpacity, SafeAreaView, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useGlobalState } from '../components/user';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, off } from 'firebase/database';
import 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const firebaseConfig = {
  apiKey: "AIzaSyAR8fZvrfGOqygweDnWVmWsQkjmnXYSLbs",
  authDomain: "bennysfinalproject.firebaseapp.com",
  projectId: "bennysfinalproject",
  storageBucket: "bennysfinalproject.appspot.com",
  messagingSenderId: "740588169462",
  appId: "1:740588169462:web:547e9c35fb038af59fa4d7",
  measurementId: "G-WPXWGFS8N3",
  databaseURL: "https://bennysfinalproject-default-rtdb.firebaseio.com/"
};
const app = initializeApp(firebaseConfig);
//firebase.analytics();
const database = getDatabase();

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user, setUser } = useGlobalState();
  const navigation = useNavigation();
  const [inputBorderColor, setInputBorderColor] = useState('white');

  const sendMessage = () => {

    if (newMessage.trim() === '') {
      setInputBorderColor('red');
      return;
    }
    setInputBorderColor('white');

    push(ref(database, 'messages'), {
      text: newMessage,
      timestamp: Date.now(),
      userName: user?.name
    });

    setNewMessage('');
  };
  const convertTimestampToDate = (timestamp) => {
    // Create a new Date object with the timestamp
    const date = new Date(timestamp);

    // Get the date and time components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Pad with leading zero
    const day = String(date.getDate()).padStart(2, '0'); // Pad with leading zero
    const hours = String(date.getHours()).padStart(2, '0'); // Pad with leading zero
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Pad with leading zero
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Pad with leading zero

    // Format the date and time as a string
    const formattedDateTime = `${year}-${month}-${day} @ ${hours}:${minutes}:${seconds}`;
    return formattedDateTime;
  };
  useEffect(() => {
    const messagesRef = ref(database, 'messages');

    const handleNewMessage = (snapshot) => {
      const messageData = snapshot.val();
      if (messageData) {
        const messagesArray = Object.keys(messageData).map((key) => ({
          id: key,
          ...messageData[key],
        }));
        setMessages(messagesArray);
      }
    };

    onValue(messagesRef, handleNewMessage);

    return () => {
      // Cleanup: Remove the listener when the component unmounts
      off(messagesRef, 'value', handleNewMessage);
    };
  }, []);
  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { zIndex: 10 }]}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.loginText}>Chat</Text>
        </View>
        <FlatList style={{ marginLeft: 5 }}
          data={JSON.parse(JSON.stringify(messages)).reverse()}
          renderItem={({ item }) => (
            <Text style={{ marginBottom: 10, color: 'white', fontSize: 17 }}>{convertTimestampToDate(item?.timestamp)} By {user?.name}: {item?.text}</Text>
          )}
          keyExtractor={(item) => item.id.toString()}
          inverted
        />
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <TextInput
            style={{
              flex: 0.96, // Adjust this value to make it smaller
              borderWidth: 1,
              padding: 10,
              marginBottom: 20,
              borderColor: inputBorderColor,
              color: '#FFFFFF',
              marginLeft: 10,
              borderRadius: 5,
              textAlign: 'left'
            }}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            placeholderTextColor="#FFFFFF"
          />
          <Pressable style={{ marginLeft: 10, marginTop: 5 }}>
            <FontAwesome name='send' size={24} color="#1DB954" onPress={sendMessage} />
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

export default Chat

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    justifyContent: 'center', // Center items horizontally
  },
  backButton: {
    position: 'absolute', // Position the back button absolutely
    left: 20, // Adjust this value as needed
  },
  loginText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    flex: 1, // Take up remaining space
    textAlign: 'center',
  }
})