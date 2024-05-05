import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
// This is the admin navigation panel
const Admin = () => {
    const navigation = useNavigation();
    return (
        <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.navigate('EmailLogin')} style={[styles.backButton, { zIndex: 10 }]}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>Admin Portal</Text>
                </View>
                <ScrollView>
                    <View style={styles.contentContainer}>
                        <View style={styles.inputContainer}>
                            {/* Input fields go here */}
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('UsersReport')} style={styles.loginButton}>
                            <Text style={styles.buttonText}>Users</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>navigation.navigate('ArtistsReport')} style={styles.loginButton}>
                            <Text style={styles.buttonText}>Artists</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('SongsReport')}>
                            <Text style={styles.buttonText}>Songs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.loginButton} onPress={()=>navigation.navigate('GenresReport')}>
                            <Text style={styles.buttonText}>Genres</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.loginButton} onPress={()=>navigation.navigate('GeneralReport')}>
                            <Text style={styles.buttonText}>General Report</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.loginButton} onPress={()=>navigation.navigate('Messages')}>
                            <Text style={styles.buttonText}>Messages</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.loginButton} onPress={()=>navigation.navigate('SendNotification')}>
                            <Text style={styles.buttonText}>Send Notification</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}

export default Admin

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1
    },
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center'
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
        textAlign: 'center',
        margin:5
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
