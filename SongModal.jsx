import { StyleSheet, Text, View, Image, Pressable, Modal, TextInput, Button } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { apiStart } from './api'
import { Ionicons, AntDesign, Entypo, FontAwesome, Feather, MaterialIcons, EvilIcons } from '@expo/vector-icons';
import { BottomModal, ModalContent } from 'react-native-modals';
import { AudioPlayer } from './AudioPlayer';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import LyricsOverlay from './LyricsModal';
import { usePlaylistsContext } from './Playlists';
import { useLikedSongsContext } from './LikedSongs';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import { shareAsync } from 'expo-sharing';
import {Slider} from '@miblanchard/react-native-slider';
import { useRecommendedContext } from './Recommended';

const SongModal = ({ gapValue }) => {
    const { audioPlayer, setAudioPlayer, playPreviousTrack, changePosition, playNextTrack, handlePlayPause, updateTrackIsInFav } = useContext(AudioPlayer);
    const [modalVisible, setModalVisible] = useState(false);
    const [addPlaylistModalVisible, setAddPlaylistModalVisible] = useState(false);
    const { playlists, setPlaylists } = usePlaylistsContext();
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const navigation = useNavigation();
    const [showLyricsVisible, setShowLyricsVisible] = useState(false);
    const { likedSongs, setLikedSongs } = useLikedSongsContext();
    const { recommended, setRecommended } = useRecommendedContext();
    const circleSize = 12;
    const getPlaylists = () => {
        const api = `${apiStart}/Playlists/GetUserPlaylists/UserID/${user?.id}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                if (res != undefined && res.message != undefined && res.message.toLowerCase().includes('error')) return;
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
                if (likedSongs.length <= 1) {
                    setLikedSongs([]);
                    return;
                }
                let tmp = [...likedSongs];
                for (s in tmp) {
                    if (tmp[s].songID === songID) {
                        tmp.splice(s, 1);
                        break;
                    }
                }
                setLikedSongs([...tmp])
                let tmp2 = [...recommended];
                for (song of tmp2) {
                    if (song.songID === songID) {
                        song.totalLikes--;
                        break;
                    }
                }
                setRecommended([...tmp2])
            })
            .catch(e => console.log(e))
    };
    const addToFavorites = (songID) => {
        const api = `${apiStart}/Users/PostUserFavorite/UserID/${user?.id}/SongID/${songID}`;
        fetch(api, { method: "POST", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                updateTrackIsInFav();
                if (res?.songID === songID) {
                    setLikedSongs([...likedSongs, res]);
                    let tmp2 = [...recommended];
                    for (song of tmp2) {
                        if (song.songID === songID) {
                            song.totalLikes++;
                            break;
                        }
                    }
                    setRecommended([...tmp2])
                }
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
                if (res.message === "Success!") {
                    let tmp = [...playlists];
                    for (p of tmp) {
                        if (p.id === playlistID) {
                            p.numberOfSongs++;
                            break;
                        }
                    }
                    setPlaylists([...tmp]);
                }
            }).catch((e) => console.log(e))
    };

    async function OpenOnYT() {
        const song = audioPlayer?.currentTrack?.songName;
        const artist = audioPlayer?.currentTrack?.performerName;
        const apiKey = 'AIzaSyAUBDnPCnsMDLrpjpfT9RNnIi25AQD65B8';
        const formattedSongName = encodeURIComponent(song);
        const formattedArtistName = encodeURIComponent(artist);
        const songNameSearch = song.replace(/\s/g, '+');
        const artistNaeSearch = artist.replace(/\s/g, '+');
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${formattedSongName} ${formattedArtistName}&key=${apiKey}`;
        const YTSearchUrl = `https://www.youtube.com/results?search_query=${songNameSearch} ${artistNaeSearch}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            // Retrieve the video ID of the first search result
            const videoId = data.items[0].id.videoId;
            // Construct the YouTube video URL
            if (audioPlayer?.isPlaying === true) {
                await handlePlayPause();
            }
            const YTLink = `https://www.youtube.com/watch?v=${videoId}`;
            Linking.openURL(YTLink);
        } catch (error) {
            console.log(error);
            return YTSearchUrl;
        }
    }
    const showLyrics = () => {
        setShowLyricsVisible(true);
    };
    const hideLyricsModal = () => {
        setShowLyricsVisible(false);
    };
    const downloadSong = async () => {
        const audioUrl = `${apiStart}/Songs/GetSongByID/SongID/${audioPlayer?.currentTrack?.songID}`;
        FileSystem.downloadAsync(
            audioUrl,
            FileSystem.documentDirectory + audioPlayer?.currentTrack?.songName + ".mp3"
        )
            .then(async ({ uri }) => {
                // console.log('Finished downloading to ', uri);
                await shareAsync(uri);
                //Linking.openURL(uri)
            })
            .catch(error => {
                console.error(error);
            });
    }
    const jumpSongSection = (value) => {
        changePosition(value);
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
                        {(!(audioPlayer?.currentTrack?.isRadioStation === true)) &&
                            <Pressable>
                                {audioPlayer?.currentTrack?.isInFav == 1 ? <AntDesign onPress={() => deleteFromFavorites(audioPlayer?.currentTrack?.songID)} name="heart" size={24} color="#1DB954" />
                                    : <AntDesign onPress={() => addToFavorites(audioPlayer?.currentTrack?.songID)} name="hearto" size={24} color="#1DB954" />}
                            </Pressable>
                        }
                        <Pressable onPress={handlePlayPause}>
                            {audioPlayer?.isPlaying === true ? <AntDesign name="pausecircle" size={24} color="white" />
                                : <AntDesign name="play" size={24} color="white" />}
                        </Pressable>
                    </View>
                </Pressable>
            )}
            <BottomModal visible={modalVisible} onHardwareBackPress={() => setModalVisible(false)} swipeDirection={["up", "down"]}
                onSwipeOut={() => setModalVisible(false)}
                swipeThreshold={200}>
                <ModalContent style={{ height: "100%", width: "100%", backgroundColor: "#5072A7" }}>
                    <View style={{ height: "100%", width: "100%", marginTop: 40 }}>
                        <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <AntDesign name="down" size={24} color="white" onPress={() => setModalVisible(!modalVisible)} />
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>{audioPlayer?.currentTrack?.songName}</Text>
                            {(!(audioPlayer?.currentTrack?.isRadioStation === true)) &&
                                <Pressable onPress={showPlaylists}>
                                    <Ionicons name="add" size={45} color='white' />
                                </Pressable>}
                        </Pressable>
                        <View style={{ height: 70 }} />
                        <View style={{ padding: 10 }}>
                            <Image style={{ height: 330, width: "100%", borderRadius: 4 }} source={{ uri: audioPlayer?.currentTrack?.performerImage }} />
                            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>{audioPlayer?.currentTrack?.songName}</Text>
                                    <Pressable onPress={() => {
                                        navigation.navigate('Artist', {
                                            item: {
                                                performerName: audioPlayer?.currentTrack?.performerName,
                                                performerImage: audioPlayer?.currentTrack?.performerImage,
                                                performerID: audioPlayer?.currentTrack?.performerID
                                            }
                                        }); setModalVisible(false);
                                    }}>
                                        <Text style={{ marginTop: 4, color: '#D3D3D3' }}>{audioPlayer?.currentTrack?.performerName}</Text>
                                    </Pressable>
                                </View>
                                {(!(audioPlayer?.currentTrack?.isRadioStation === true)) &&
                                <View style={{ flexDirection: 'row' }}>
                                    <Pressable onPress={downloadSong}>
                                        <EvilIcons name='arrow-down' size={31} color='#1DB954' />
                                    </Pressable>
                                    {(!(audioPlayer?.currentTrack?.isRadioStation === true)) &&
                                        <View>
                                            {audioPlayer?.currentTrack?.isInFav == 1 ? <AntDesign onPress={() => deleteFromFavorites(audioPlayer?.currentTrack?.songID)} name="heart" size={24} color="#1DB954" />
                                                : <AntDesign onPress={() => addToFavorites(audioPlayer?.currentTrack?.songID)} name="hearto" size={24} color="#1DB954" />}</View>}
                                </View>}
                            </View>
                            <View style={{ marginTop: 10 }}>
                                {((audioPlayer?.currentTrack?.isRadioStation === true)) &&
                                <View style={{ width: '100%', marginTop: 10, height: 3, backgroundColor: 'gray', borderRadius: 5 }}>
                                    <View style={[styles.progressbar, { width: `${audioPlayer.progress * 100}%` }]} />
                                    <View style={[
                                        {
                                            position: 'absolute', top: -5, width: circleSize, height: circleSize, borderRadius: circleSize / 2,
                                            backgroundColor: 'white'
                                        }, { left: `${audioPlayer.progress * 100}%`, marginLeft: -circleSize / 2 }
                                    ]} />
                                </View>}
                                {(!(audioPlayer?.currentTrack?.isRadioStation === true)) &&
                                <Slider onSlidingComplete={jumpSongSection} value={audioPlayer.progress} thumbTintColor='white' minimumTrackTintColor='white' maximumTrackTintColor='gray' />
                                }
                                <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={{ color: '#D3D3D3', fontSize: 15 }}>{formatTime(audioPlayer.currentTime)}</Text>

                                    <Text style={{ color: '#D3D3D3', fontSize: 15 }}>{(!(audioPlayer?.currentTrack?.isRadioStation === true)) ? formatTime(audioPlayer.totalDuration === null ? 0 : audioPlayer.totalDuration) : 'Live'}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 17 }}>
                                {(!(audioPlayer?.currentTrack?.isRadioStation === true)) &&
                                    <Pressable onPress={showLyrics}>
                                        <MaterialIcons name="lyrics" size={30} color="purple" />
                                    </Pressable>
                                }
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
                                {(!(audioPlayer?.currentTrack?.isRadioStation === true)) &&
                                    <Pressable onPress={OpenOnYT} style={{
                                        backgroundColor: 'white',
                                        borderRadius: 15, // Half of the size of the icon to make it circular
                                        width: 30, // Size of the icon
                                        height: 30, // Size of the icon
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <Entypo name="youtube-with-circle" size={30} color="#FF0000" />
                                    </Pressable>}
                            </View>
                        </View>
                    </View>
                </ModalContent>
            </BottomModal>
            {showLyricsVisible && <LyricsOverlay song={audioPlayer.currentTrack} hideLyricsModal={hideLyricsModal} />}
            {addPlaylistModalVisible === true && (
                <View style={{ flex: 1 }}>
                    <Modal
                        visible={addPlaylistModalVisible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => { setAddPlaylistModalVisible(false); setMessage(''); }} >
                        <Pressable
                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                            onPress={() => { setAddPlaylistModalVisible(false); setMessage(''); }}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text style={{ textAlign: 'center', color: '#3bc8e7', fontSize: 25, fontWeight: 'bold', marginBottom: 5 }}>Choose Playlist</Text>
                                    {playlists && playlists?.map((p, index) => (
                                        <Pressable key={index} onPress={() => addSongToPlaylist(p?.id)}><Text style={{ textAlign: 'center', color: 'black', fontSize: 20, margin: 5 }}>{p?.name}</Text></Pressable>
                                    ))}
                                    {message != '' && <Text style={{ color: message === "Success!" ? 'green' : 'red', fontSize: 28, textAlign: 'center' }}>{message}</Text>}
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