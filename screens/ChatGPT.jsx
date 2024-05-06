import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { GeminiAPIKey } from '../apikeys'
import { Ionicons, Entypo, AntDesign, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FlatList, TextInput } from 'react-native'
import { useGlobalState } from '../components/user';

const ChatGPT = () => {
    const { user, setUser } = useGlobalState();
    const navigation = useNavigation();
    const [messages, setMessages] = useState([]);
    const [inputBorderColor, setInputBorderColor] = useState('white');
    const [newMessage, setNewMessage] = useState('');
    const [index, setIndex] = useState(0);
    const sendMessage = async () => {
        let tmp = [...messages, {userName:user?.name,text:newMessage,id:index}];
        setMessages([...messages, {userName:user?.name,text:newMessage,id:index}])
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GeminiAPIKey}`;
        const bodyRequest = { contents: [{ parts: [{ text: newMessage, },], },], };
        setNewMessage('')
        try {
            const result = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', }, body: JSON.stringify(bodyRequest), });
            const resultAsjson = await result.json();
            let resultAsString = ``;
            if (resultAsjson.candidates) {
                for (i of resultAsjson.candidates) {
                    if (i.content && i.content.parts) {
                        for (j of i.content.parts) {
                            if (j.text) {
                                resultAsString += j.text;
                            }
                        }
                    }
                }
            }
            tmp = [...tmp, {userName:'Gemini',text:resultAsString,id:index+1}]
            setMessages([...tmp])
            setIndex(prevState => prevState + 2)
        } catch (error) {
            console.error("this is the error", error);
        }
    }
    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { zIndex: 10 }]}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>Chat With Gemini</Text>
                </View>
                <FlatList style={{ marginLeft: 5 }}
                    data={JSON.parse(JSON.stringify(messages)).reverse()}
                    renderItem={({ item }) => (
                        <Text style={{ marginBottom: 10, color: 'white', fontSize: 17 }}><Text style={{color:'#1DB954', fontSize: 17}}>{item?.userName}</Text>: {item?.text}</Text>
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

export default ChatGPT

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
      fontSize: 25,
      fontWeight: 'bold',
      flex: 1, // Take up remaining space
      textAlign: 'center',
    }
  })