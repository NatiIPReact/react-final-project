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

const Search = () => {
    const [input, setInput] = useState('');
    const navigation = useNavigation();
    const { user, setUser } = useGlobalState();
    const [queryResult, setQueryResult] = useState([]);
    const { audioPlayer, setAudioPlayer, updateQueueAndPlay, shuffleQueue } = useContext(AudioPlayer);
    const handleInputChange = (text) => {
        setInput(text);
    };
    useEffect(() => { if (input) search(input) }, [input]);
    const search = () => {
        const api = `${apiStart}/Songs/SearchByQuery/query/${input}/UserID/${user?.id || 0}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                setQueryResult(res);
            }).catch(e => console.log(e));
    };
    const playSong = (songToPlay) => {
        updateQueueAndPlay(songToPlay?.songID, [songToPlay], 0);
    };
    return (
        <>
            <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
                <View style={{ flex: 1, marginTop: 50 }}>
                    <Pressable style={{ marginHorizontal: 10 }} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </Pressable>
                    <Pressable style={{ marginHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
                        <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'white', padding: 10, flex: 1, borderRadius: 7, height: 38 }}>
                            <AntDesign name="search1" size={20} color="black" />
                            <TextInput placeholderTextColor={"black"} value={input} onChangeText={(text) => handleInputChange(text)} placeholder="What do you want to listen to?" style={{ fontWeight: '500', color: 'black' }} />
                        </Pressable>
                    </Pressable>
                    <ScrollView>
                    <View>
                        <View style={{ marginTop: 10, marginHorizontal: 12 }}>
                            {queryResult.map((track, index) => (
                                <Pressable onPress={()=>{playSong(track)}} key={track?.songID} style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
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
                    </ScrollView>
                </View>
                <SongModal gapValue={85} />
            </LinearGradient>
        </>
    )
}

export default Search

const styles = StyleSheet.create({})