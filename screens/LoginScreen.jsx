import { StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Entypo, MaterialCommunityIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { Buffer } from 'buffer';
import { apiStart } from '../api';

const discovery = {
    authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const spotifyClient_id = `46f746d8a9bd4ee68095e27d1a0b154c`;
const spotifyClient_secret = `e7866f59b4364e709cde7ffa897cf25a`;

const LoginScreen = () => {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [requestSpotify, responseSpotify, promptAsyncSpotify] = useAuthRequest(
        {
            clientId: '46f746d8a9bd4ee68095e27d1a0b154c',
            scopes: ['user-read-email'],
            // To follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
            // this must be set to false
            usePKCE: false,
            redirectUri: makeRedirectUri({
                scheme: 'exp://localhost:8081/--/spotify-auth-callback'
            }),
        },
        discovery
    );
    const [spotifyAccount, setSpotifyAccount] = useState(null);
    useEffect(() => {
        if (responseSpotify && responseSpotify?.params?.code != undefined) {
            const redirectURI = `exp://192.168.0.115:8081`;
            const body = `grant_type=authorization_code&redirect_uri=${redirectURI}&code=${responseSpotify?.params?.code}`;
            fetch(discovery.tokenEndpoint, {
                method: 'POST'
                , headers: new Headers({
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + (new Buffer.from(spotifyClient_id + ':' + spotifyClient_secret).toString('base64'))
                }), body: body
            })
                .then(res => res.json())
                .then(res => {
                    if (res != undefined && res.access_token != undefined) {
                        setAccessToken(res.access_token)
                    }
                }).catch(e => console.log("ERROR " + e))
        }
    }, [responseSpotify]);
    useEffect(() => {
        if (accessToken != null) {
            fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${accessToken}` } })
                .then(async res => {
                    if (res.ok === true) {
                        const response = await res.json();
                        if (response != undefined && response.email != undefined) {
                            setSpotifyAccount(response);
                        }
                    }
                })
                .catch(e => console.log("ERROR " + e))
        }
    }, [accessToken])
    useEffect(() => {
        if (spotifyAccount != null) {
            const api = `${apiStart}/Users/GetUserByEmail/email/${spotifyAccount.email}`;
            fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
                .then(res => res.json())
                .then(res => {
                    if (res != undefined && res.message == undefined) {
                        if (res.isVerified === false) {
                            setErrorMessage('Verify your email to login!');
                            const api = `${apiStart}/Users/InitiateNewValidation`;
                            let user = {
                                "id": res?.id,
                                "email": res?.email,
                                "name": res?.name,
                                "password": res?.password,
                                "isVerified": false,
                                "registrationDate": new Date(),
                                "isBanned": false,
                                "image": ""
                            };
                            fetch(api, { method: "PUT", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }), body: JSON.stringify(user) })
                            .then(res => res.json())
                            .then(res => {
                                console.log(res)
                            }).catch(e => console.log(e));
                            return;
                        }
                        setErrorMessage('');
                        const userAsJSON = JSON.stringify(res);
                        AsyncStorage.setItem('@user', userAsJSON, () => { navigation.navigate("Main") });
                    } else if (res.message != undefined) {
                        navigation.navigate('SpotifySignup', {
                            name: spotifyAccount.display_name,
                            email: spotifyAccount.email
                        });
                    }
                }).catch(e => console.log(e))
        }
    }, [spotifyAccount])
    function Login() {
        navigation.navigate("EmailLogin")
    };
    useEffect(() => {
        tryLogin();
    }, []);
    const tryLogin = async () => {
        try {
            const userAsJSON = await AsyncStorage.getItem('@user');
            if (userAsJSON != null) {
                navigation.navigate("Main")
            }
        } catch (e) {
            navigation.navigate("Login");
        }
    }
    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <SafeAreaView>
                <View style={{ height: 80 }} />
                <Entypo name="spotify" size={80} color="white" style={{ textAlign: "center" }} />
                <Text style={{ color: "white", fontSize: 30, fontWeight: "bold", textAlign: "center", marginTop: 40 }}>Many Songs Free on Ruppinfy!</Text>
                <View style={{ height: 60 }} />
                <Text style={{ color: 'red', fontSize: 30, fontWeight: '500', textAlign: 'center', marginBottom: 20, display: errorMessage ? 'flex' : 'none' }}>{errorMessage}</Text>
                <Pressable onPress={Login} style={{
                    backgroundColor: "#1DB954",
                    padding: 10,
                    marginLeft: "auto",
                    marginRight: "auto",
                    width: 300,
                    borderRadius: 25,
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <Text>Sign In</Text>
                </Pressable>
                <Pressable onPress={() => promptAsyncSpotify()}
                    style={{
                        backgroundColor: "#131624",
                        padding: 10,
                        marginLeft: "auto",
                        marginRight: "auto",
                        width: 300,
                        borderRadius: 25,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        alignItems: "center",
                        marginVertical: 10,
                        borderColor: "#C0C0C0",
                        borderWidth: 0.8
                    }}
                >
                    <Entypo name="spotify" size={24} color="#1DB954" />
                    <Text style={{ fontWeight: "500", color: "white", textAlign: "center", flex: 1 }}>Sign In with Spotify</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Signup')}
                    style={{
                        backgroundColor: "#131624",
                        padding: 10,
                        marginLeft: "auto",
                        marginRight: "auto",
                        width: 300,
                        borderRadius: 25,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        alignItems: "center",
                        marginVertical: 10,
                        borderColor: "#C0C0C0",
                        borderWidth: 0.8
                    }}
                >
                    <MaterialCommunityIcons name="email" size={24} color="white" />
                    <Text style={{ fontWeight: "500", color: "white", textAlign: "center", flex: 1 }}>Sign up free</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Additions')}
                    style={{
                        backgroundColor: "#131624",
                        padding: 10,
                        marginLeft: "auto",
                        marginRight: "auto",
                        width: 300,
                        borderRadius: 25,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        alignItems: "center",
                        marginVertical: 10,
                        borderColor: "#C0C0C0",
                        borderWidth: 0.8
                    }}
                >
                    <Ionicons name="add-sharp" size={24} color="white" />
                    <Text style={{ fontWeight: "500", color: "white", textAlign: "center", flex: 1 }}>My Additions</Text>
                </Pressable>
            </SafeAreaView>
        </LinearGradient>
    )
}

export default LoginScreen

const styles = StyleSheet.create({})