import { Button, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, off, update, set } from 'firebase/database';
import { useGlobalState } from '../components/user';
import SongModal from '../SongModal';
import { inline } from 'react-native-web/dist/cjs/exports/StyleSheet/compiler';

const firebaseConfig = {
    apiKey: "AIzaSyAR8fZvrfGOqygweDnWVmWsQkjmnXYSLbs",
    authDomain: "bennysfinalproject.firebaseapp.com",
    projectId: "bennysfinalproject",
    storageBucket: "bennysfinalproject.appspot.com",
    messagingSenderId: "740588169462",
    appId: "1:740588169462:web:547e9c35fb038af59fa4d7",
    measurementId: "G-WPXWGFS8N3",
    databaseURL: "https://bennysfinalproject-default-rtdb.firebaseio.com/"
};
const app = initializeApp(firebaseConfig);
//firebase.analytics();
const database = getDatabase();

const ListenTogether = () => {
    const navigation = useNavigation();
    const [lobbies, setLobbies] = useState([]);
    const { user, setUser } = useGlobalState();
    const [joinWithCodeModalVisible, setJoinWithCodeModalVisible] = useState(false);
    const [modalBorderColor, setModalBorderColor] = useState('gray')
    const [code, setCode] = useState('');
    useEffect(() => {
        const lobbiesRef = ref(database, 'lobbies');

        const handleNewLobby = (snapshot) => {
            const lobbyData = snapshot.val();
            if (lobbyData) {
                const lobbiesArray = Object.keys(lobbyData).map((key) => ({
                    firebaseID: key,
                    ...lobbyData[key],
                }));
                setLobbies(lobbiesArray);
            }
            else setLobbies([]);
        };

        onValue(lobbiesRef, handleNewLobby);

        return () => {
            // Cleanup: Remove the listener when the component unmounts
            off(lobbiesRef, 'value', handleNewLobby);
        };
    }, []);
    function generateRandom8Digits() {
        return Math.floor(Math.random() * 90000000) + 10000000;
    }
    const createLobby = () => {
        let inLobby = false;
        let lobby;
        for (i of lobbies) {
            for (j of i?.usersInLobby) {
                if (j?.id === user?.id) {
                    inLobby = true;
                    lobby = i;
                    break;
                }
            }
        }
        if (inLobby) {
            navigation.navigate('Lobby', { lobbyData: lobby })
            return;
        }
        let newLobby = {
            id: generateRandom8Digits(),
            leader: { id: user?.id, name: user?.name },
            currentSong: null,
            usersInLobby: [{ id: user?.id, name: user?.name }]
        }
        push(ref(database, 'lobbies'), newLobby);
        setLobbies([...lobbies, newLobby])
        navigation.navigate('Lobby', { lobbyData: newLobby })
    };
    const joinLobby = (lobbyToJoin) => {
        let inLobby = false;
        let lobby;
        for (i of lobbies) {
            for (j of i?.usersInLobby) {
                if (j?.id === user?.id) {
                    inLobby = true;
                    lobby = i;
                    break;
                }
            }
        }
        if (inLobby) {
            navigation.navigate('Lobby', { lobbyData: lobby })
        } else {
            const lobbyRef = ref(database, `lobbies/${lobbyToJoin?.firebaseID}`);
            if (lobbyToJoin && lobbyToJoin.usersInLobby)
                lobbyToJoin.usersInLobby.push({ id: user?.id, name: user?.name });
            else lobbyToJoin.usersInLobby = [{ id: user?.id, name: user?.name }]
            set(lobbyRef, lobbyToJoin)
                .then(res => {
                    navigation.navigate('Lobby', { lobbyData: lobbyToJoin })
                }).catch(res => console.log('error', res))
        }
    };
    const join = () => {
        if (code === "") {
            setModalBorderColor('red');
            return;
        }
        let lobbyExist = false;
        let lobby;
        for (i in lobbies) {
            if (lobbies[i]?.id == code) {
                lobbyExist = true;
                lobby = i;
                break;
            }
        }
        if (lobbyExist) {
            setCode('')
            setModalBorderColor('gray');
            setJoinWithCodeModalVisible(false);
            joinLobby(lobbies[i])
            return
        }
        setModalBorderColor('red');
    }
    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { zIndex: 10 }]}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.loginText}>Listen Together</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, justifyContent: 'center' }}>
                <TouchableOpacity style={styles.playButton} onPress={createLobby}>
                    <Text style={styles.buttonText}>Create Lobby</Text>
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, justifyContent: 'center' }}>
                <TouchableOpacity style={styles.playButton} onPress={() => setJoinWithCodeModalVisible(true)}>
                    <Text style={styles.buttonText}>Join With Code</Text>
                </TouchableOpacity>
            </View>
            <View><Text style={{ color: 'white', fontSize: 20, marginLeft: 10, fontWeight: 'bold' }}>Created By</Text></View>
            {lobbies && lobbies?.map((lobby, index) => (
                <Pressable key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} onPress={() => joinLobby(lobby)}>
                    <Text style={{ color: 'white', fontSize: 18, marginLeft: 15, fontWeight: '500', marginTop: 15 }}>{lobby?.leader?.name}</Text>
                    <AntDesign name="play" size={24} color="white" style={{ marginRight: 20, marginTop: 17 }} />
                </Pressable>
            ))}
            {joinWithCodeModalVisible === true && (
                <View style={{ flex: 1 }}>
                    <Modal
                        visible={joinWithCodeModalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => {setJoinWithCodeModalVisible(false); setCode(''); setModalBorderColor('gray')}}
                    >
                        <Pressable
                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                            onPress={() => {setJoinWithCodeModalVisible(false); setCode(''); setModalBorderColor('gray')}}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <TextInput
                                        style={{
                                            height: 40,
                                            borderColor: modalBorderColor,
                                            borderWidth: (modalBorderColor === "red") ? 3 : 1,
                                            marginBottom: 10,
                                            paddingHorizontal: 10,
                                            color: 'black'
                                        }}
                                        placeholder="Enter session code"
                                        value={code}
                                        onChangeText={setCode}
                                        keyboardType="phone-pad"
                                    />
                                    <Button title="Join" onPress={join}></Button>
                                </View>
                            </View>
                        </Pressable>
                    </Modal>
                </View>
            )}
            <SongModal gapValue={55} />
        </LinearGradient>
    )
}

export default ListenTogether

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        justifyContent: 'center', // Center items horizontally
        marginTop: 50
    },
    backButton: {
        position: 'absolute', // Position the back button absolutely
        left: 20, // Adjust this value as needed
    },
    loginText: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
        flex: 1, // Take up remaining space
        textAlign: 'center',
    },
    playButton: {
        backgroundColor: '#6247aa',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
        width: '80%',
        textAlign: 'center'
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    playButton: {
        backgroundColor: '#6247aa',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
        width: '80%',
        textAlign: 'center'
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: '100%'
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%'
    }
})