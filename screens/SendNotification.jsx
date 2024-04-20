import { Image, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons, FontAwesome } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import registerForPushNotificationsAsync from '../NotificationComponent';
import { apiStart } from '../api';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

const SendNotification = () => {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const [expoTokens, setExpoTokens] = useState([]);
    const notificationListener = useRef();
    const responseListener = useRef();
    const navigation = useNavigation();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    useEffect(() => {
        const api = `${apiStart}/Users/GetExpoTokens`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
        .then(res => res.json())
        .then(res => {
            let tokens = [];
            for (i of res) {
                if (i.expoToken !== "") {
                    tokens.push(i.expoToken);
                }
            }
            let uniqueTokens = [...new Set(tokens)];
            setExpoTokens(uniqueTokens);
        }).catch(e => console.log(e));
        //registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
        // This listener is fired whenever a notification is received while the app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            //console.log(notification);
            setNotification(notification);
        });
        //This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            //console.log(response);
            setNotification(response.notification);
        });
        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);
    async function sendPushNotification(expoPushToken) {
        const message = {
            to: expoPushToken,
            sound: 'default',
            title: title,
            body: body,
            data: { seconds: new Date().getSeconds() }
        };
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    }
    const push = () => {
        if (title === "" || body === "") {
            setErrorMessage('Enter all details!');
            return;
        }
        sendPushNotification(expoTokens);
        setErrorMessage('');
        setSuccessMessage('Sent!');
    };
    return (
        <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {setErrorMessage('');setSuccessMessage('');navigation.goBack()}} style={[styles.backButton, { zIndex: 10 }]}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>Send Notification</Text>
                </View>
                <View style={styles.contentContainer}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Title"
                        placeholderTextColor="#003f5c"
                        onChangeText={(newTitle) => setTitle(newTitle)}
                        value={title}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Body"
                        placeholderTextColor="#003f5c"
                        onChangeText={(newBody) => setBody(newBody)}
                        value={body}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity style={styles.loginButton} onPress={push}>
                        <Text style={styles.buttonText}>Push</Text>
                    </TouchableOpacity>
                    <Text style={{ color: 'red', fontSize: 23, marginTop: 5, display: errorMessage ? 'flex' : 'none' }}>{errorMessage}</Text>
                    <Text style={{ color: 'green', fontSize: 23, marginTop: 5, display: successMessage ? 'flex' : 'none' }}>{successMessage}</Text>
                </View>
            </View>
            </SafeAreaView>
        </LinearGradient>
    )
}

export default SendNotification

const styles = StyleSheet.create({
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
    safeArea: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        justifyContent: 'center', // Center items horizontally
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