import { StyleSheet, Text, View, Image, Pressable, Modal, TextInput, Button } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { apiStart } from './api'
import { Ionicons, AntDesign, Entypo, FontAwesome, Feather } from '@expo/vector-icons';
import { BottomModal, ModalContent } from 'react-native-modals';
import { AudioPlayer } from './AudioPlayer';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SongModal = ({ gapValue }) => {
    const { audioPlayer, setAudioPlayer, playPreviousTrack, playNextTrack, handlePlayPause, updateTrackIsInFav } = useContext(AudioPlayer);
    const [modalVisible, setModalVisible] = useState(false);
    const [addPlaylistModalVisible, setAddPlaylistModalVisible] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const navigation = useNavigation();
    const circleSize = 12;
    const getPlaylists = () => {
        const api = `${apiStart}/Playlists/GetUserPlaylists/UserID/${user?.id}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                setPlaylists(res);
            }).catch((err) => console.log(err));
    };
    const getUser = async () => {
        try {
            const userAsJSON = await AsyncStorage.getItem('@user');
            if (userAsJSON == null) {
                return;
            }
            setUser(JSON.parse(userAsJSON));
        } catch (e) {
            console.log(e)
        }
    }
    useEffect(() => {
        getUser();
    }, []);
    useEffect(() => {
        if (user != null && playlists.length === 0) {
            getPlaylists();
        }
    }, [user]);
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };
    const deleteFromFavorites = (songID) => {
        const api = `${apiStart}/Users/DeleteUserFavorite/UserID/${user?.id}/SongID/${songID}`;
        fetch(api, { method: "DELETE", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                updateTrackIsInFav()
            })
            .catch(e => console.log(e))
    };
    const addToFavorites = (songID) => {
        const api = `${apiStart}/Users/PostUserFavorite/UserID/${user?.id}/SongID/${songID}`;
        fetch(api, { method: "POST", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                updateTrackIsInFav();
            })
            .catch(e => console.log(e))
    };
    const showPlaylists = () => {
        setAddPlaylistModalVisible(true);
    };
    const addSongToPlaylist = (playlistID) => {
        const api = `${apiStart}/Playlists/InsertSongToPlaylist`;
        let SongInPlaylist = {
            playlistID: playlistID,
            songID: audioPlayer?.currentTrack?.songID
        };
        fetch(api, { method: "PUT", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }), body: JSON.stringify(SongInPlaylist) })
            .then((res) => res.json())
            .then(res => {
                setMessage(res.message)
            }).catch((e) => console.log(e))
    };
    return (
        <>
            {audioPlayer.currentTrack && (
                <Pressable onPress={() => setModalVisible(!modalVisible)} style={{ backgroundColor: "#5072A7", width: "90%", padding: 10, marginLeft: 'auto', marginRight: 'auto', marginBottom: gapValue, position: 'absolute', borderRadius: 6, left: 20, bottom: 10, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Image style={{ width: 40, height: 40 }} source={{ uri: audioPlayer?.currentTrack?.performerImage }} />
                        <Text numberOfLines={1} style={{
                            fontSize: 13, width: 204, color: 'white', fontWeight: 'bold'
                        }}>{audioPlayer?.currentTrack?.songName} • {audioPlayer?.currentTrack?.performerName}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Pressable>
                            {audioPlayer?.currentTrack?.isInFav == 1 ? <AntDesign onPress={() => deleteFromFavorites(audioPlayer?.currentTrack?.songID)} name="heart" size={24} color="#1DB954" />
                                : <AntDesign onPress={() => addToFavorites(audioPlayer?.currentTrack?.songID)} name="hearto" size={24} color="#1DB954" />}
                        </Pressable>
                        <Pressable onPress={handlePlayPause}>
                            {audioPlayer?.isPlaying === true ? <AntDesign name="pausecircle" size={24} color="white" />
                                : <AntDesign name="play" size={24} color="white" />}
                        </Pressable>
                    </View>
                </Pressable>
            )}
            <BottomModal visible={modalVisible} onHardwareBackPress={() => setModalVisible(false)} swipeDirection={["up", "down"]}
                swipeThreshold={200}>
                <ModalContent style={{ height: "100%", width: "100%", backgroundColor: "#5072A7" }}>
                    <View style={{ height: "100%", width: "100%", marginTop: 40 }}>
                        <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <AntDesign name="down" size={24} color="white" onPress={() => setModalVisible(!modalVisible)} />
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{audioPlayer?.currentTrack?.songName}</Text>
                            <Pressable onPress={showPlaylists}>
                                <Ionicons name="add" size={45} color='white' />
                            </Pressable>
                        </Pressable>
                        <View style={{ height: 70 }} />
                        <View style={{ padding: 10 }}>
                            <Image style={{ height: 330, width: "100%", borderRadius: 4 }} source={{ uri: audioPlayer?.currentTrack?.performerImage }} />
                            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>{audioPlayer?.currentTrack?.songName}</Text>
                                    <Text style={{ marginTop: 4, color: '#D3D3D3' }}>{audioPlayer?.currentTrack?.performerName}</Text>
                                </View>
                                {audioPlayer?.currentTrack?.isInFav == 1 ? <AntDesign onPress={() => deleteFromFavorites(audioPlayer?.currentTrack?.songID)} name="heart" size={24} color="#1DB954" />
                                    : <AntDesign onPress={() => addToFavorites(audioPlayer?.currentTrack?.songID)} name="hearto" size={24} color="#1DB954" />}
                            </View>
                            <View style={{ marginTop: 10 }}>
                                <View style={{ width: '100%', marginTop: 10, height: 3, backgroundColor: 'gray', borderRadius: 5 }}>
                                    <View style={[styles.progressbar, { width: `${audioPlayer.progress * 100}%` }]} />
                                    <View style={[
                                        {
                                            position: 'absolute', top: -5, width: circleSize, height: circleSize, borderRadius: circleSize / 2,
                                            backgroundColor: 'white'
                                        }, { left: `${audioPlayer.progress * 100}%`, marginLeft: -circleSize / 2 }
                                    ]} />
                                </View>
                                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ color: '#D3D3D3', fontSize: 15 }}>{formatTime(audioPlayer.currentTime)}</Text>

                                    <Text style={{ color: '#D3D3D3', fontSize: 15 }}>{formatTime(audioPlayer.totalDuration === null ? 0 : audioPlayer.totalDuration)}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 17 }}>
                                <Pressable>
                                    <FontAwesome name="arrows" size={30} color="#03C03C" />
                                </Pressable>
                                <Pressable onPress={playPreviousTrack}>
                                    <Ionicons name="play-skip-back" size={30} color="white" />
                                </Pressable>
                                <Pressable onPress={handlePlayPause}>
                                    {audioPlayer?.isPlaying ? (
                                        <AntDesign name="pausecircle" size={60} color="white" />
                                    ) : (
                                        <Pressable onPress={handlePlayPause} style={{
                                            width: 60, height: 60, borderRadius: 30, backgroundColor: 'white'
                                            , justifyContent: 'center', alignItems: 'center'
                                        }}>
                                            <Entypo name="controller-play" size={35} color="black" />
                                        </Pressable>
                                    )}
                                </Pressable>
                                <Pressable onPress={playNextTrack}>
                                    <Ionicons name="play-skip-forward" size={30} color="white" />
                                </Pressable>
                                <Pressable>
                                    <Feather name="repeat" size={30} color="#03C03C" />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </ModalContent>
            </BottomModal>
            {addPlaylistModalVisible === true && (
                <View style={{ flex: 1 }}>
                    <Modal
                        visible={addPlaylistModalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => {setAddPlaylistModalVisible(false); setMessage('');}} >
                        <Pressable
                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                            onPress={() => {setAddPlaylistModalVisible(false); setMessage('');}}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text style={{ textAlign:'center', color: '#3bc8e7', fontSize: 25, fontWeight: 'bold',marginBottom:5 }}>Choose Playlist</Text>
                                    {playlists && playlists?.map((p, index) => (
                                        <Pressable key={index} onPress={() => addSongToPlaylist(p?.id)}><Text style={{ textAlign:'center', color: 'black', fontSize: 20,margin:5 }}>{p?.name}</Text></Pressable>
                                    ))}
                                    {message != '' && <Text style={{color:message === "Success!" ? 'green' : 'red',fontSize:28,textAlign:'center'}}>{message}</Text>}
                                </View>
                            </View>
                        </Pressable>
                    </Modal>
                </View>
            )}
        </>
    )
}

export default SongModal

const styles = StyleSheet.create({
    progressbar: {
        height: '100%',
        backgroundColor: 'white'
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