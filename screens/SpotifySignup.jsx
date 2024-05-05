import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiStart } from '../api';
// This is the spotify signup page.
const SpotifySignup = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const Register = () => {
        if (password.length < 3) {
            setErrorMessage("Password must contain atleast 3 characters!");
            return;
        }
        const api = `${apiStart}/Users`;
        let user = {
            "id": 0,
            "email": route.params.email,
            "name": route.params.name,
            "password": password,
            "isVerified": false,
            "registrationDate": new Date(),
            "isBanned": false,
            'image':''
        };
        fetch(api, { method: "POST", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }), body:JSON.stringify(user) })
            .then((res) => {
                return res.json();
            }).then((res) => {
                if (res.message !== "Registered!") {
                    setErrorMessage(res.message);
                    return;
                }
                setSuccessMessage("Welcome. Please verify your email to login.");
                setErrorMessage('');
                //storeUser(user);
            }).catch((err) => console.log(err));
    };
    return (
        <LinearGradient colors={['#040306', '#131624']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={()=>navigation.goBack()} style={[styles.backButton, { zIndex: 10 }]}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>Sign up</Text>
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={{color:'white',marginBottom:20,fontSize:25,fontWeight:'bold'}}>Welcome, {route.params.name}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Choose a Password"
                            placeholderTextColor="#003f5c"
                            onChangeText={(newPassword) => setPassword(newPassword)}
                            value={password}
                            secureTextEntry
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity style={styles.loginButton} onPress={Register}>
                            <Text style={styles.buttonText}>Sign up</Text>
                        </TouchableOpacity>
                        <Text style={{ color: 'red', fontSize: 23, marginTop: 5, display: errorMessage ? 'flex' : 'none' }}>{errorMessage}</Text>
                        <Text style={{ color: 'green', fontSize: 23, marginTop: 5, display: successMessage ? 'flex' : 'none' }}>{successMessage}</Text>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}

export default SpotifySignup

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