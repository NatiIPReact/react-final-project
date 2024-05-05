import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import { useGlobalState } from '../components/user';
import { apiStart } from '../api';
import SongModal from '../SongModal';
// This is the contact us page.
const ContactUs = () => {
    const navigation = useNavigation();
    const { user, setUser } = useGlobalState();
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const save = () => {
        if (subject == "" || content == "") {
            setErrorMessage('Fill the form!');
            return;
        }
        let data = {
            "messageID": 0,
            "subject": subject,
            "content": content,
            "date": "2023-07-24T20:21:07.727Z",
            "userID": user?.id,
            "userName": "",
            "userEmail": ""
        };
        const api = `${apiStart}/Messages`;
        fetch(api, { method: "POST", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }), body:JSON.stringify(data) })
        .then(res => res.json())
        .then(res => {
            setSuccessMessage('Sent!')
            setErrorMessage('');
        }).catch(e => console.log(e))
    };
  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => {setErrorMessage('');setSuccessMessage('');navigation.goBack()}} style={[styles.backButton, { zIndex: 10 }]}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.loginText}>Contact Us</Text>
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Subject"
                        placeholderTextColor="#003f5c"
                        onChangeText={(newSubject) => setSubject(newSubject)}
                        value={subject}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="What do you need help with?"
                        placeholderTextColor="#003f5c"
                        onChangeText={(newContent) => setContent(newContent)}
                        value={content}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity style={styles.loginButton} onPress={save}>
                        <Text style={styles.buttonText}>Send</Text>
                    </TouchableOpacity>
                    <Text style={{ color: 'red', fontSize: 23, marginTop: 5, display: errorMessage ? 'flex' : 'none' }}>{errorMessage}</Text>
                    <Text style={{ color: 'green', fontSize: 23, marginTop: 5, display: successMessage ? 'flex' : 'none' }}>{successMessage}</Text>
                </View>
            </View>
            <SongModal gapValue={25} />
        </LinearGradient>
  )
}

export default ContactUs

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        justifyContent: 'center', // Center items horizontally
        marginTop: 50
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
    },
    playButton: {
        backgroundColor: '#6247aa',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
        width: '80%',
        textAlign: 'center'
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    inputContainer: {
        alignItems: 'center',
        width: '80%',
        marginTop: "-40%"
    },
    input: {
        height: 50,
        backgroundColor: '#CBCBCB',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: '100%',
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#6247aa',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    }
})