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
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { GoogleAPIKey } from '../apikeys';

const recordingOptions = {
    // android not currently in use, but parameters are required
    android: {
        extension: '.m4a',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 16000,
        numberOfChannels: 2,
        bitRate: 128000,
    },
    ios: {
        extension: '.wav',
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
    },
};

const Search = () => {
    const [input, setInput] = useState('');
    const { recommended, setRecommended } = useRecommendedContext();
    const navigation = useNavigation();
    const { user, setUser } = useGlobalState();
    const [queryResult, setQueryResult] = useState([]);
    const [artists, setArtists] = useState([]);
    const { audioPlayer, setAudioPlayer, updateQueueAndPlay, shuffleQueue } = useContext(AudioPlayer);
    const [micColor, setMicColor] = useState('black');
    const [recording, setRecording] = useState();
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
                                length: convertLengthToSeconds(song.length),
                                artistLikes: song.songFavorites
                            }
                            artists.push(artist);
                        } else {
                            for (art of artists) {
                                if (art.performerID === song.performerID) {
                                    art.songs++;
                                    art.length += convertLengthToSeconds(song.length);
                                    art.artistLikes += song.songFavorites
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
    const searchByVoice = async () => {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: true,

        });
        const rec = new Audio.Recording();
        setRecording(rec);
        try {
            await rec.prepareToRecordAsync(recordingOptions);
            await rec.startAsync();
            setMicColor('blue');
        } catch (error) {
            console.log(error);
            setRecording(undefined);
        }
    };
    const stopRecordingAndGetTranscript = async () => {
        setMicColor('red');
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync(
            {
                allowsRecordingIOS: false,
            }
        );
        const uri = recording.getURI();
        try {
            const audioData = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64
            });
            const audioConfig = {
                encoding: 'LINEAR16',
                sampleRateHertz: 16000,
                languageCode: "en-US",
                enable_word_time_offsets: true,
                enable_word_confidence: true
            };
            const test = {
                audio: {
                    content: audioData,
                },
                config: audioConfig,
            }
            const apiKey = GoogleAPIKey;
            const response = await fetch(`https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${apiKey}`, {
                method: 'POST',
                body: JSON.stringify(test)
            });
            const data = await response.json();
            if (data.results === undefined) {
                setRecording(undefined);
                setMicColor('black');
                return;
            }
            let text = '';
            for (i of data.results) {
                if (i === undefined || i.alternatives === undefined) continue;
                for (j of i.alternatives) {
                    if (j === undefined || j.transcript === undefined) continue;
                    text += j.transcript;
                }
            }
            if (text != undefined) {
                setInput(text);
            }
        } catch (err) {
            console.log('There was an error', err);
        }
        setRecording(undefined);
        setMicColor('black');
    };
    return (
        <>
            <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
                <View style={{ flex: 1, marginTop: 50 }}>
                    <View style={{ marginHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'white', padding: 10, flex: 1, borderRadius: 7, height: 38 }}>
                            <AntDesign name="search1" size={20} color="black" />
                            <TextInput placeholderTextColor={"black"} value={input} onChangeText={(text) => handleInputChange(text)} placeholder="What do you want to listen to?" style={{ fontWeight: '500', color: 'black', width: '83%' }} />
                            <Pressable onPress={micColor === 'blue' ? stopRecordingAndGetTranscript : searchByVoice}><FontAwesome name='microphone' size={20} color={micColor} /></Pressable>
                        </View>
                    </View>
                    <ScrollView>
                        <View>
                            <View style={{ marginTop: 10, marginHorizontal: 12 }}>
                                {queryResult.length === 0 && !input &&
                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Recommended For You</Text>}
                                {queryResult.length === 0 && !input && recommended.slice(0, 5).map((track, index) => (
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
                                        <View>
                                            <Text style={{ fontSize: 16, fontWeight: '500', color: "gray" }}>{track?.songLength}</Text>
                                            <Text style={{ fontSize: 16, fontWeight: '500', color: "gray", textAlign: 'center' }}>{track?.totalLikes} ♥</Text>
                                        </View>
                                    </Pressable>
                                ))}
                                {queryResult.length === 0 && !input && <Pressable onPress={() => navigation.navigate('Shazam')}>
                                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Shazam Your Song</Text>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Image style={{ width: 150, height: 150 }}
                                            source={{ uri: 'https://cdn.icon-icons.com/icons2/1826/PNG/512/4202070logoshazamsocialsocialmedia-115618_115683.png' }} />
                                    </View>
                                </Pressable>}
                                {queryResult.length === 0 && input && <Text style={{color:'white', fontWeight:'bold',
                                    fontSize:23, textAlign:'center', marginTop:25
                                }}>No Results Found...</Text>}
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
                                        <View>
                                            <Text style={{ fontSize: 16, fontWeight: '500', color: "gray" }}>{ConvertSecondsToLength(artist?.length)}</Text>
                                            <Text style={{ fontSize: 16, fontWeight: '500', color: "gray", textAlign: 'center' }}>{artist?.artistLikes} ♥</Text>
                                        </View>
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
                                        <View>
                                            <Text style={{ fontSize: 16, fontWeight: '500', color: "gray" }}>{track?.length}</Text>
                                            <Text style={{ fontSize: 16, fontWeight: '500', color: "gray", textAlign: 'center' }}>{track?.songFavorites} ♥</Text>
                                        </View>
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