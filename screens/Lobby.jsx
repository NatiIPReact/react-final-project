import { StyleSheet, Text, View, TouchableOpacity, TextInput, Pressable, Image } from 'react-native'
import React, { useContext } from 'react'
import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue, off, update, set, remove } from 'firebase/database';
import { useGlobalState } from '../components/user';
import { AudioPlayer } from '../AudioPlayer';
import { apiStart } from '../api';
import SongModal from '../SongModal';

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

const Lobby = () => {
    const route = useRoute();
    const [lobbyData, setLobbyDate] = useState(null);
    const { audioPlayer, setAudioPlayer, updateQueueAndPlay, changePosition, shuffleQueue, updateTrackIsInFav } = useContext(AudioPlayer);
    const [lobbies, setLobbies] = useState(null);
    const { user, setUser } = useGlobalState();
    const navigation = useNavigation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [input, setInput] = useState('');
    const [queryResult, setQueryResult] = useState([]);
    useEffect(() => {
        setLobbyDate(route?.params?.lobbyData);
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
        };

        onValue(lobbiesRef, handleNewLobby);

        return () => {
            // Cleanup: Remove the listener when the component unmounts
            off(lobbiesRef, 'value', handleNewLobby);
        };
    }, [])
    useEffect(() => {
        if (lobbyData != null) {
            if (lobbyData.currentSong != null && isPlaying === false) {
                updateQueueAndPlay(lobbyData.currentSong.songID, [lobbyData.currentSong], 0, lobbyData.currentSong.currentPosition);
                setIsPlaying(true);
            } else if (lobbyData.currentSong != null && lobbyData.currentSong.songID !== (audioPlayer?.currentTrack?.songID || -1)) {
                updateQueueAndPlay(lobbyData.currentSong.songID, [lobbyData.currentSong], 0, lobbyData.currentSong.currentPosition);
                setIsPlaying(true);
            }
        }
    }, [lobbyData])
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            console.log('d')
            leave()
        });
        return unsubscribe
    }, [navigation])
    useEffect(() => {
        if (lobbies == null) return
        let lobbyExists = false;
        let lobbyINeed;
        for (lobby of lobbies) {
            if (lobby.id === route?.params?.lobbyData?.id) {
                lobbyExists = true
                lobbyINeed = lobby
                break
            }
        }
        if (!lobbyExists) {
            leave()
            return;
        } else setLobbyDate(lobbyINeed)
    }, [lobbies])
    useEffect(() => {
        if (input) {
            search(input)
        } else {
            setTimeout(() => {
                setQueryResult([]);
            }, 600)
        }
    }, [input]);
    const search = () => {
        const api = `${apiStart}/Songs/SearchByQuery/query/${input}/UserID/${user?.id || 0}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                setQueryResult(res);
            }).catch(e => console.log(e));
    };
    const leave = () => {
        const lobbyRef = ref(database, `lobbies/${lobbyData?.firebaseID}`);
        if (lobbyData.usersInLobby.length <= 1) {
            // Remove the lobby from the database
            remove(lobbyRef)
                .then(() => {
                    navigation.goBack()
                })
                .catch((error) => {
                    console.error("Error removing lobby: ", error);
                });
        } else {
            let tmp = [...lobbyData.usersInLobby]
            for (userIndex in tmp) {
                if (tmp[userIndex].id === user?.id) {
                    tmp.splice(userIndex, 1)
                    break
                }
            }
            let newLobbyData = { ...lobbyData, usersInLobby: [...tmp] };
            if (newLobbyData.leader.id === user?.id) {
                newLobbyData.leader = tmp[0]
            }
            setLobbyDate(newLobbyData)
            set(lobbyRef, newLobbyData)
                .then(res => {
                    navigation.goBack()
                }).catch(res => console.log('error', res))
        }
    };
    const handleInputChange = (text) => {
        setInput(text);
    };
    const playSong = (songToPlay) => {
        const lobbyRef = ref(database, `lobbies/${lobbyData?.firebaseID}`);
        let newLobbyData = JSON.parse(JSON.stringify(lobbyData))
        newLobbyData.currentSong = { ...songToPlay, currentPosition: 0 }
        set(lobbyRef, newLobbyData)
    };
    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={leave} style={[styles.backButton, { zIndex: 10 }]}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.loginText}>{route?.params?.lobbyData?.id}</Text>
            </View>
            <View style={{ marginHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'white', padding: 10, flex: 1, borderRadius: 7, height: 38 }}>
                    <AntDesign name="search1" size={20} color="black" />
                    <TextInput placeholderTextColor={"black"} value={input} onChangeText={(text) => handleInputChange(text)} placeholder="What do you want to listen to?" style={{ fontWeight: '500', color: 'black', width: '83%' }} />
                </View>
            </View>
            {queryResult.length > 0 &&
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 15, marginLeft: 10 }}>Songs</Text>}
            {queryResult.slice(0, 5).map((track, index) => (
                <Pressable onPress={() => { playSong(track) }} key={track?.songID} style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between', marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row' }}>
                        <Image source={{ uri: track?.performerImage }}
                            style={{ width: 50, height: 50, borderRadius: 3 }} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={{ fontSize: 16, fontWeight: '500', color: audioPlayer?.currentTrack?.songID === track?.songID ? "#3FFF00" : "white" }}>{track?.songName}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                                <Text style={{ color: 'gray', fontSize: 16, fontWeight: '500' }}>{track?.performerName} • {track?.genreName}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: '500', color: "gray" }}>{track?.length}</Text>
                    </View>
                </Pressable>
            ))}
            <Text style={{ color: 'white', fontSize: 25, fontWeight: 'bold', textAlign: 'center', marginTop: 10 }}>Currently Listening</Text>
            {lobbyData && lobbyData?.usersInLobby?.map((userName, index) => (
                <Text key={index} style={{ color: 'white', fontSize: 23, fontWeight: '500', marginLeft: 10, marginTop: 10 }}>{userName?.name}</Text>
            ))}
            <SongModal gapValue={85} />
        </LinearGradient>
    )
}

export default Lobby

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
    }
})