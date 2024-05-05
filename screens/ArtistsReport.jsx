import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiStart } from '../api';
import { ScrollView } from 'react-native';
// This is the artist's report (for admins)
const ArtistsReport = () => {
    const navigation = useNavigation();
    const [songsData, setSongsData] = useState([]);
    useEffect(() => {
        const api = `${apiStart}/Performers/AdminGetPerformersData`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => res.json())
            .then(res => {
                setSongsData(res);
            }).catch(e => console.log(e))
    }, [])
  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { zIndex: 10 }]}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>Artists Report</Text>
                </View>
                <ScrollView  style={{
                    flex: 1,
                    padding: 10,
                    backgroundColor: '#fff'
                }}>
                    <View style={styles.headerRow}>
                        <Text style={styles.headerCell}>ID</Text>
                        <Text style={styles.headerCell}>Name</Text>
                        <Text style={styles.headerCell}>Band?</Text>
                        <Text style={styles.headerCell}>Instagram</Text>
                        <Text style={styles.headerCell}>Plays</Text>
                        <Text style={styles.headerCell}>Followers</Text>
                        <Text style={styles.headerCell}>Favorites</Text>
                    </View>
                    {songsData?.map((item, index) => (
                        <View key={index} style={styles.dataRow}>
                            <Text style={styles.dataCell}>{item?.performerID}</Text>
                            <Text style={styles.dataCell}>{item?.performerName}</Text>
                            <Text style={styles.dataCell}>{item?.isABand === true ? 'True' : 'False'}</Text>
                            <Text style={styles.dataCell}>{item?.performerInstagram}</Text>
                            <Text style={styles.dataCell}>{item?.totalPlays}</Text>
                            <Text style={styles.dataCell}>{item?.totalFollowers}</Text>
                            <Text style={styles.dataCell}>{item?.numOfUserFavorites}</Text>
                        </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
  )
}

export default ArtistsReport

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
        margin: 5
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dataRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    dataCell: {
        flex: 1,
        textAlign: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 5,
        marginBottom: 10,
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});