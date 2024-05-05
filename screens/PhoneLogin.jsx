import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiStart } from '../api';
import registerForPushNotificationsAsync from '../NotificationComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
// This is the phone login page
const PhoneLogin = () => {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [sendButtonText, setSendButtonText] = useState('Send Verification Code')
    const [textInputPlaceholderText, setTextInputPlaceholderText] = useState('Phone Number (With Country Code)');
    const [storePhone, setStorePhone] = useState('');
    const sendCode = () => {
        if (name === "") {
            setErrorMessage("Enter your number first!");
            return;
        }
        const api = `${apiStart}/Users/PhoneLogin/Phone/${name}`;
        fetch(api, { method: "POST", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(async res => {
                if (res.ok === false) {
                    setErrorMessage("This phone doesn't exist! (or it's not verified with Twilio because they want MONEY!!)");
                    return;
                } else {
                    const resss = await res.json();
                    if (resss?.message === "This phone number is not registered to any user!") {
                        setErrorMessage(resss?.message);
                        return;
                    }
                    setStorePhone(name);
                    setErrorMessage('');
                    setName('');
                    setTextInputPlaceholderText('Enter Code');
                    setSendButtonText('Submit');
                }
            })
            .catch(e => console.log(e));
    };
    const submitCode = () => {
        const api = `${apiStart}/Users/VerifyCode/Phone/${storePhone}/Code/${name}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => {
                return res.json()
            })
            .then(res => {
                if (res != undefined && res.message != undefined && res.message === "approved") {
                    setErrorMessage('')
                    const userAPI = `${apiStart}/Users/GetUserByPhone/Phone/${storePhone}`;
                    fetch(userAPI, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
                        .then(res => res.json())
                        .then(res => {
                            if (res?.isBanned === true) {
                                setErrorMessage(`You're Banned!`);
                                return;
                            }
                            const userAsJSON = JSON.stringify(res);
                            registerForPushNotificationsAsync().then(token => {
                                const api = `${apiStart}/Users/UpdateUserExpoToken/UserID/${res.id}/ExpoToken/${token}`;
                                fetch(api, { method: "PUT", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) });
                            });
                            AsyncStorage.setItem('@user', userAsJSON, () => { navigation.navigate("Main") });
                        }).catch(e => console.log(e));
                    return;
                }
                setErrorMessage('Invalid Code!')
            })
            .catch(e => console.log(e));
    };
    return (
        <LinearGradient colors={['#040306', '#131624']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { zIndex: 10 }]}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>Mobile Login</Text>
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder={textInputPlaceholderText}
                            placeholderTextColor="#003f5c"
                            onChangeText={(newName) => setName(newName)}
                            value={name}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="phone-pad"
                        />
                        <TouchableOpacity style={styles.loginButton} onPress={sendButtonText === "Submit" ? submitCode : sendCode}>
                            <Text style={styles.buttonText}>{sendButtonText}</Text>
                        </TouchableOpacity>
                        <Text style={{ color: 'red', fontSize: 23, marginTop: 5, display: errorMessage ? 'flex' : 'none' }}>{errorMessage}</Text>
                        <Text style={{ color: 'green', fontSize: 23, marginTop: 5, display: successMessage ? 'flex' : 'none' }}>{successMessage}</Text>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}

export default PhoneLogin

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
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
    },
});