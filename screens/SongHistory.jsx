import { Pressable, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import SongModal from '../SongModal'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import { AudioPlayer } from '../AudioPlayer'
import { useGlobalState } from '../components/user'
import { apiStart } from '../api'
import { useRecentlyPlayedContext } from '../RecentlyPlayed'

const SongHistory = () => {
    const navigation = useNavigation()
    const { audioPlayer, setAudioPlayer, updateQueueAndPlay } = useContext(AudioPlayer);
    const { user, setUser } = useGlobalState();
    const {recentlyPlayed, setRecentlyPlayed} = useRecentlyPlayedContext();
    /*
    useEffect(() => {
        if (user) {
            getUserSongHistory();
        }
    }, []);
    const getUserSongHistory = () => {
        const api = `${apiStart}/Users/GetUserSongHistory/UserID/${user?.id}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => res.json())
            .then(res => {
                setRecentlyPlayed(res);
            }).catch(error => console.log(error))
    };
    */
    const playSong = (songID) => {
        for (i of recentlyPlayed) {
            if (i.songID === songID) {
                updateQueueAndPlay(songID, [i], 0);
                break;
            }
        }
    };
    return (
        <>
            <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { zIndex: 10 }]}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>Recently Played</Text>
                </View>
                <ScrollView>
                    <View>
                        <View style={{ marginTop: 10, marginHorizontal: 12 }}>
                            {recentlyPlayed.length > 0 ? recentlyPlayed?.map((track, index) => (
                                <Pressable onPress={() => { playSong(track?.songID) }} key={track?.songID} style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image source={{ uri: track?.performerImage }}
                                            style={{ width: 50, height: 50, borderRadius: 3 }} />
                                        <View style={{ marginLeft: 10 }}>
                                            <Text style={{ fontSize: 16, fontWeight: '500', color: audioPlayer?.currentTrack?.songID === track?.songID ? "#3FFF00" : "white" }}>{track?.songName}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                                                <Text style={{ color: 'gray', fontSize: 16, fontWeight: '500' }}>{track?.performerName} • {track?.genreName} • {track?.length}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <Pressable onPress={() => playSong(track?.songID)}>
                                        <AntDesign name='play' size={24} color="#1DB954" />
                                    </Pressable>
                                </Pressable>
                            )) : <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 15 }}>Your history is empty...</Text>}
                        </View>
                    </View>
                    </ScrollView>
                    <View style={{ height: audioPlayer?.currentTrack == null ? 0 : 95 }}></View>
            </LinearGradient>
            <SongModal gapValue={25} />
        </>
    )
}

export default SongHistory

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
    }
})