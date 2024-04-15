import { StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Entypo,MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
    const navigation = useNavigation();
    function Login () {
        navigation.navigate("EmailLogin")
    };
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
                    <Text style={{ fontWeight: "500", color: "white", textAlign: "center", flex: 1 }}>Sign In with facebook</Text>
                </Pressable>
                <Pressable onPress={()=>navigation.navigate('Signup')}
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