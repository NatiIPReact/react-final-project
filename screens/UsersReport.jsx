import { Pressable, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiStart } from '../api';
import { ScrollView } from 'react-native';

const UsersReport = () => {
    const navigation = useNavigation();
    const [songsData, setSongsData] = useState([]);
    useEffect(() => {
        const api = `${apiStart}/Users/LoadUserInformation`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => res.json())
            .then(res => {
                setSongsData(res);
            }).catch(e => console.log(e))
    }, [])
    const handleUserBan = (userID, isBanned, index) => {
        var api;
        if (isBanned === true) {
            api = `${apiStart}/Users/UnbanUser?UserID=${userID}`;
        } else {
            api = `${apiStart}/Users/BanUser?UserID=${userID}`;
        }
        fetch(api, { method: "PUT", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
        .then(res => res.json())
        .then(res => {
            let tmp = [...songsData];
            tmp[index].isBanned = !isBanned;
            setSongsData([...tmp]);
        })
        .catch(e => console.log(e))
    };
    return (
        <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { zIndex: 10 }]}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>Users Report</Text>
                </View>
                <ScrollView style={{
                    flex: 1,
                    padding: 10,
                    backgroundColor: '#fff'
                }}>
                    <View style={styles.headerRow}>
                        <Text style={styles.headerCell}>ID</Text>
                        <Text style={styles.headerCell}>Name</Text>
                        <Text style={styles.headerCell}>Email</Text>
                        <Text style={styles.headerCell}>Registration Date</Text>
                        <Text style={styles.headerCell}>Ban</Text>
                    </View>
                    {songsData?.map((item, index) => (
                        <View key={index} style={styles.dataRow}>
                        <Text style={styles.dataCell}>{item?.id}</Text>
                        <Text style={styles.dataCell}>{item?.name}</Text>
                        <Text style={styles.dataCell}>{item?.email}</Text>
                        <Text style={styles.dataCell}>{item?.registrationDate?.split('T')[0]}</Text>
                        <Pressable
                          onPress={() => handleUserBan(item?.id, item?.isBanned, index)}
                          style={({ pressed }) => [
                            {
                              backgroundColor: pressed ? '#ddd' : '#fff',
                              padding: 10,
                              borderRadius: 5,
                            },
                            styles.button
                          ]}
                        >
                          <Text style={styles.buttonText}>
                            {item?.isBanned === true ? 'Unban' : 'Ban'}
                          </Text>
                        </Pressable>
                      </View>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    )
}

export default UsersReport

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
        color: 'black',
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