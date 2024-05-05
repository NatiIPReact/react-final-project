import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { apiStart } from '../api'
import AsyncStorage from '@react-native-async-storage/async-storage';
import registerForPushNotificationsAsync from '../NotificationComponent';
// This is the forgot password page.
const ForgotPassword = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [btnMessage, setBtnMessage] = useState('Send Code');
    const [storeEmail, setStoreEmail] = useState('');
    const SendCode = () => {
        if (email === '') {
            setErrorMessage('Enter email first!');
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            setErrorMessage('Enter correct email!');
            return;
        }
        const api = `${apiStart}/Users/UserForgotPassword`;
        let user = {
            "id": 0,
            "email": email,
            "name": "",
            "password": "",
            "isVerified": false,
            "registrationDate": new Date(),
            "isBanned": false,
            "image": ""
        };
        fetch(api, { method: "PUT", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }), body: JSON.stringify(user) })
        .then(res => res.json())
        .then(res => {
            if (res != undefined && res.message != undefined) {
                setErrorMessage(res.message);
                return;
            }
            setErrorMessage('');
            setSuccessMessage('A verification code was sent to your email.');
            setStoreEmail(email);
            setBtnMessage('Submit');
            setEmail('');
        }).catch(err => {console.log(err); setErrorMessage('Server ERROR');})
        setErrorMessage('');
    };
    const SubmitCode = () => {
        const api = `${apiStart}/Users/VerifyResetPasswordCode/UserEmail/${storeEmail}/Code/${email}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
        .then(res => res.json())
        .then(res => {
            if (res.correct === false) {
                setSuccessMessage('');
                setErrorMessage('Wrong Code!');
                return;
            }
            setErrorMessage('');
            setEmail('');
            setSuccessMessage('');
            setBtnMessage('Save');
        }).catch(err => {console.log(err); setErrorMessage('Server ERROR');})
    };
    const SavePassword = () => {
        if (email.length < 3) {
            setErrorMessage('Password must contain atleast 3 characters!')
            return;
        }
        const api = `${apiStart}/Users/UpdateUserPasswordByEmail/UserEmail/${storeEmail}/Password/${email}`;
        fetch(api, { method: "PUT", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
        .then(res => res.json())
        .then(res => {
            setErrorMessage('')
            setEmail('');
            setSuccessMessage('Your password has been updated.')
        }).catch(err => {console.log(err); setErrorMessage('Server ERROR');})
    };
    return (
        <LinearGradient colors={['#040306', '#131624']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { zIndex: 10 }]}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>Reset Password</Text>
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.inputContainer}>
                        {btnMessage !== 'Save' &&
                        <TextInput
                            style={styles.input}
                            placeholder={btnMessage === 'Submit' ? 'Verification Code' : btnMessage === 'Save' ? 'New Password' : 'Email'}
                            placeholderTextColor="#003f5c"
                            onChangeText={(newEmail) => setEmail(newEmail)}
                            value={email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />}
                        {btnMessage === 'Save' &&
                        <TextInput
                            style={styles.input}
                            placeholder='New Password'
                            placeholderTextColor="#003f5c"
                            onChangeText={(newEmail) => setEmail(newEmail)}
                            value={email}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />}
                    </View>
                    <TouchableOpacity style={styles.loginButton} onPress={btnMessage === 'Submit' ? SubmitCode : btnMessage === 'Save' ? SavePassword : SendCode}>
                        <Text style={styles.buttonText}>{btnMessage}</Text>
                    </TouchableOpacity>
                    <Text style={{ color: 'red', fontSize: 23, marginTop: 5, display: errorMessage ? 'flex' : 'none' }}>{errorMessage}</Text>
                    <Text style={{ color: '#1DB954', fontSize: 23, marginTop: 5, display: successMessage ? 'flex' : 'none' }}>{successMessage}</Text>
                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}

export default ForgotPassword

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
        width: '80%',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});