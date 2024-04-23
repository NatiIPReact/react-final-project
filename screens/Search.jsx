import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, AntDesign, MaterialCommunityIcons, Entypo, FontAwesome, Feather } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native';
import { useGlobalState } from '../components/user';
import { apiStart } from '../api';
import { AudioPlayer } from '../AudioPlayer';
import SongModal from '../SongModal';
import { useRecommendedContext } from '../Recommended';

const Search = () => {
    const [input, setInput] = useState('');
    const { recommended, setRecommended } = useRecommendedContext();
    const navigation = useNavigation();
    const { user, setUser } = useGlobalState();
    const [queryResult, setQueryResult] = useState([]);
    const [artists, setArtists] = useState([]);
    const { audioPlayer, setAudioPlayer, updateQueueAndPlay, shuffleQueue } = useContext(AudioPlayer);
    const handleInputChange = (text) => {
        setInput(text);
    };
    function convertLengthToSeconds(mmss) {
        var parts = mmss.split(':');
        var minutes = parseInt(parts[0], 10);
        var seconds = parseInt(parts[1], 10);
        return minutes * 60 + seconds;
    }
    useEffect(() => {
        if (input) {
            search(input)
        } else {
            setTimeout(() => {
                setQueryResult([]);
                setArtists([]);
            }, 600)
        }
    }, [input]);
    const search = () => {
        const api = `${apiStart}/Songs/SearchByQuery/query/${input}/UserID/${user?.id || 0}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                let artists = [];
                let artistsIDs = [];
                for (song of res) {
                    if (song.performerName.toLowerCase().includes(input.toLowerCase())) {
                        if (!artistsIDs.includes(song.performerID)) {
                            artistsIDs.push(song.performerID);
                            let artist = {
                                performerID: song.performerID,
                                performerImage: song.performerImage,
                                performerName: song.performerName,
                                songs: 1,
                                length: convertLengthToSeconds(song.length)
                            }
                            artists.push(artist);
                        } else {
                            for (art of artists) {
                                if (art.performerID === song.performerID) {
                                    art.songs++;
                                    art.length += convertLengthToSeconds(song.length);
                                    break;
                                }
                            }
                        }
                    }
                }
                setArtists([...artists]);
                setQueryResult(res);
            }).catch(e => console.log(e));
    };
    const playSong = (songToPlay) => {
        updateQueueAndPlay(songToPlay?.songID, [songToPlay], 0);
    };
    function pad(val) {
        return val < 10 ? '0' + val : val;
    }
    const ConvertSecondsToLength = (totalSeconds) => {
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;
        return pad(minutes) + ':' + pad(seconds);
    }
    return (
        <>
            <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
                <View style={{ flex: 1, marginTop: 50 }}>
                    <Pressable style={{ marginHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
                        <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'white', padding: 10, flex: 1, borderRadius: 7, height: 38 }}>
                            <AntDesign name="search1" size={20} color="black" />
                            <TextInput placeholderTextColor={"black"} value={input} onChangeText={(text) => handleInputChange(text)} placeholder="What do you want to listen to?" style={{ fontWeight: '500', color: 'black' }} />
                        </Pressable>
                    </Pressable>
                    <ScrollView>
                        <View>
                            <View style={{ marginTop: 10, marginHorizontal: 12 }}>
                                {queryResult.length === 0 &&
                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Recommended For You</Text>}
                                {queryResult.length === 0 && recommended.slice(0, 5).map((track, index) => (
                                    <Pressable onPress={() => { playSong(track) }} key={track?.songID} style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
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
                                        <Text style={{ fontSize: 16, fontWeight: '500', color: "gray" }}>{track?.songLength}</Text>
                                    </Pressable>
                                ))}
                                {artists.length > 0 &&
                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Artists</Text>}
                                {artists.slice(0, 3).map((artist, index) => (
                                    <Pressable onPress={() => { navigation.navigate('Artist', { item: artist }) }} key={artist?.performerID} style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Image source={{ uri: artist?.performerImage }}
                                                style={{ width: 50, height: 50, borderRadius: 3 }} />
                                            <View style={{ marginLeft: 10 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '500', color: "white" }}>{artist?.performerName}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                                                    <Text style={{ color: 'gray', fontSize: 16, fontWeight: '500' }}>{artist?.songs} Songs</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <Text style={{ fontSize: 16, fontWeight: '500', color: "gray" }}>{ConvertSecondsToLength(artist?.length)}</Text>
                                    </Pressable>
                                ))}
                                {queryResult.length > 0 &&
                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Songs</Text>}
                                {queryResult.slice(0, 10).map((track, index) => (
                                    <Pressable onPress={() => { playSong(track) }} key={track?.songID} style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
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
                                        <Text style={{ fontSize: 16, fontWeight: '500', color: "gray" }}>{track?.length}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                        <View style={{ height: 80 }}></View>
                    </ScrollView>
                </View>
                <SongModal gapValue={85} />
                <View style={{ height: audioPlayer?.currentTrack == null ? 0 : 75 }}></View>
            </LinearGradient>
        </>
    )
}

export default Search

const styles = StyleSheet.create({})