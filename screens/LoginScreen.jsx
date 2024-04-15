import { StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Entypo, MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
    const navigation = useNavigation();
    const [userInfo, setUserInfo] = useState(null);
    const [googleAvailble, setGoogleAvailble] = useState(true);
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: '578240915619-2sph5cos2p09g63e252818q52c23e2ev.apps.googleusercontent.com',
        webClientId: '578240915619-306oldrb57q89cd6cj8g1ia7mnt8nbgo.apps.googleusercontent.com'
    });
    useEffect(() => {handleGoogleSignin()},[response])
    async function handleGoogleSignin () {
        const user = await AsyncStorage.getItem('@user');
        if (!user) {
            if (response?.type === "success") {
                await getUserInfo(response.authentication.accessToken);
            }
        } else {
            setUserInfo(JSON.parse(user));
            console.log(JSON.parse(user));
        }
    }
    const getUserInfo = async (token) => {
        if (!token) return;
        try {
            const response = await fetch('https://www.googleapis.com/userinfo/v2/me',
        {
            headers: {Authorization:`Bearer ${token}`}
        })
        const user = await response.json();
            await AsyncStorage.setItem('@user', JSON.stringify(user));
            setUserInfo(user);
        } catch (error) {
            console.log(error)
        }
    };
    function Login() {
        navigation.navigate("EmailLogin")
    };
    useEffect(() => {
        let res = WebBrowser.maybeCompleteAuthSession();
        console.log(res);
        if (res?.type === "failed") {
            setGoogleAvailble(false);
        }
    }, []);
    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <SafeAreaView>
                <View style={{ height: 80 }} />
                <Entypo name="spotify" size={80} color="white" style={{ textAlign: "center" }} />
                <Text style={{ color: "white", fontSize: 30, fontWeight: "bold", textAlign: "center", marginTop: 40 }}>Many Songs Free on Ruppinfy!</Text>
                <View style={{ height: 80 }} />
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
                <Pressable
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
                    <Entypo name="facebook" size={24} color="#316FF6" />
                    <Text style={{ fontWeight: "500", color: "white", textAlign: "center", flex: 1 }}>Sign In with Facebook</Text>
                </Pressable>
                <Pressable onPress={promptAsync}
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
                    <AntDesign name="google" size={24} color="#DB4437" />
                    <Text style={{ fontWeight: "500", color: "white", textAlign: "center", flex: 1 }}>Sign In with Google</Text>
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
            </SafeAreaView>
        </LinearGradient>
    )
}

export default LoginScreen

const styles = StyleSheet.create({})