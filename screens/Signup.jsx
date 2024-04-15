import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { apiStart } from '../api'
import AsyncStorage from '@react-native-async-storage/async-storage';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigation = useNavigation();
    const handleBackButtonPress = () => {
        navigation.goBack();
    };
    /*
    const storeUser = async (user) => {
        try {
            const userAsJSON = JSON.stringify(user);
            await AsyncStorage.setItem('@user', userAsJSON, () => { navigation.navigate("Main") });
        } catch (err) {
            console.log(err);
        }
    }
    */
    const Register = () => {
        if (name === "") {
            setErrorMessage("Enter name!");
            return;
        }
        if (email === "") {
            setErrorMessage("Enter email!");
            return;
        }
        if (password.length < 3) {
            setErrorMessage("Password must contain atleast 3 characters!");
            return;
        }
        const api = `${apiStart}/Users`;
        let user = {
            "id": 0,
            "email": email,
            "name": name,
            "password": password,
            "isVerified": false,
            "registrationDate": new Date(),
            "isBanned": false
        };
        fetch(api, { method: "POST", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }), body:JSON.stringify(user) })
            .then((res) => {
                return res.json();
            }).then((user) => {
                if (user.message !== "Registered!") {
                    setErrorMessage(user.message);
                    return;
                }
                //storeUser(user);
            }).catch((err) => console.log(err));
    };
    return (
        <LinearGradient colors={['#040306', '#131624']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBackButtonPress} style={[styles.backButton, { zIndex: 10 }]}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>Sign up</Text>
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            placeholderTextColor="#003f5c"
                            onChangeText={(newName) => setName(newName)}
                            value={name}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#003f5c"
                            onChangeText={(newEmail) => setEmail(newEmail)}
                            value={email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
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
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

export default Signup

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