import { FlatList, Pressable, StyleSheet, Text, View, VirtualizedList, Image } from 'react-native'
import React, { useContext, useEffect, useState, useRef } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { ScrollView } from 'react-native'
import { Ionicons, AntDesign, MaterialCommunityIcons, Entypo, FontAwesome, Feather, Fontisto } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { TextInput } from 'react-native';
import { useGlobalState } from '../components/user';
import { apiStart } from '../api'
import SongItem from '../components/SongItem';
import { AudioPlayer } from '../AudioPlayer';
import { debounce } from 'lodash';
import SongModal from '../SongModal';
import { useLikedSongsContext } from '../LikedSongs';

const LikedSongsScreen = () => {
    const { audioPlayer, setAudioPlayer, updateQueueAndPlay, shuffleQueue, updateTrackIsInFav } = useContext(AudioPlayer);
    const [searchedTracks, setSearchedTracks] = useState([]);
    const navigation = useNavigation();
    const [input, setInput] = useState('');
    //const [likedSongs, setLikedSongs] = useState([]);
    const {likedSongs, setLikedSongs} = useLikedSongsContext();
    //const [currentLikedSongs, setCurrentLikedSongs] = useState([]);
    const [totalTime, setTotalTime] = useState('00:00');
    const value = useRef(0);
    const { user, setUser } = useGlobalState();
    const [sortingModalVisible, setSortingModalVisible] = useState(false);
    const [sortedBy, setSortedBy] = useState(-1);
    async function getLikedSongs() {
        const api = `${apiStart}/Users/GetUserFavorites/UserID/${user.id}`;
        fetch(api, { method: 'GET', headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((songs) => {
                setLikedSongs(songs);
                let totalSeconds = 0;
                for (song of songs) {
                    const tmp = song.length.split(':');
                    totalSeconds += parseInt(tmp[0]) * 60 + parseInt(tmp[1]);
                }
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;
                const formattedTotal = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                setTotalTime(formattedTotal);
            }).catch((e) => console.log(e));
    }
    useEffect(() => {
        if (user) {
            //getLikedSongs();
        }
    }, [user]);
    const deleteFromFavorites = (songID) => {
        const api = `${apiStart}/Users/DeleteUserFavorite/UserID/${user?.id}/SongID/${songID}`;
        fetch(api, { method: "DELETE", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                if (songID === audioPlayer?.currentTrack?.songID)
                    updateTrackIsInFav()
                if (likedSongs.length === 1) {
                    setLikedSongs([]);
                    setSearchedTracks([]);
                    return;
                }
                let tmp = [...likedSongs];
                for (i in tmp) {
                    if (tmp[i]?.songID === songID) {
                        tmp.splice(i, 1);
                        break;
                    }
                }
                setLikedSongs(tmp);
            })
            .catch(e => console.log(e))
    };
    const debouncedSearch = debounce(handleSearch, 800);
    function handleSearch(text) {
        const filteredTracks = likedSongs.filter((item) => item.songName.toLowerCase().includes(text.toLowerCase()))
        setSearchedTracks(filteredTracks);
    }
    const handleInputChange = (text) => {
        setInput(text);
        debouncedSearch(text);
    };
    useEffect(() => {
        if (likedSongs.length > 0) {
            handleSearch(input);
        }
    }, [likedSongs]);
    const playSong = (songID = 0, ind = -1) => {
        if (likedSongs.length === 0) {
            return;
        }
        if (ind === -1) {
            updateQueueAndPlay(likedSongs[0].songID, likedSongs, 0);
            return;
        }
        if (likedSongs[ind].songID === songID)
            updateQueueAndPlay(songID, likedSongs, ind);
        else {
            for (i in likedSongs) {
                if (likedSongs[i].songID === songID) {
                    updateQueueAndPlay(songID, likedSongs, i);
                    break;
                }
            }
        }
    };
    const shufflePlay = () => {
        if (likedSongs.length === 0) {
            return;
        }
        shuffleQueue(likedSongs);
    };
    const convertTimeToSeconds = (timeString) => {
        const [minutes, seconds] = timeString.split(':').map(Number);
        return minutes * 60 + seconds;
    };
    const sort = (sortBy) => {
        setSortingModalVisible(false);
        let tmp = [...searchedTracks];
        let sorted = [];
        switch (sortBy) {
            case 0:
                sorted = tmp.slice().sort((a, b) => a.songName.localeCompare(b.songName));
                break;
            case 1:
                sorted = tmp.slice().sort((a, b) => {
                    const lengthA = convertTimeToSeconds(a.length);
                    const lengthB = convertTimeToSeconds(b.length);
                    return lengthA - lengthB;
                });
                break;
            case 2:
                sorted = tmp.slice().sort((a, b) => a.performerName.localeCompare(b.performerName));
                break;
            case 3:
                sorted = tmp.slice().sort((a, b) => a.genreName.localeCompare(b.genreName));
                break;
        }
        setSearchedTracks([...sorted]);
        setSortedBy(sortBy);
    };
    return (
        <>
            <LinearGradient colors={["#641385", "#516395"]} style={{ flex: 1 }}>
                <View style={{ flex: 1, marginTop: 50 }}>
                    <Pressable style={{ marginHorizontal: 10 }} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </Pressable>
                    <Pressable style={{ marginHorizontal: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 9 }}>
                        <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#42275a', padding: 10, flex: 1, borderRadius: 7, height: 38 }}>
                            <AntDesign name="search1" size={20} color="white" />
                            <TextInput placeholderTextColor={"white"} value={input} onChangeText={(text) => handleInputChange(text)} placeholder="Find in Liked Songs" style={{ fontWeight: '500', color: 'white' }} />
                        </Pressable>
                        <Pressable onPress={() => setSortingModalVisible(true)} style={{ marginHorizontal: 10, backgroundColor: '#42275a', padding: 10, borderRadius: 7, height: 38 }}>
                            <Text style={{ color: 'white' }}>Sort</Text>
                        </Pressable>
                    </Pressable>
                    <View style={{ height: 50 }} />
                    <View style={{ marginHorizontal: 10 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>Liked Songs</Text>
                        <Text style={{ fontSize: 13, marginTop: 5, color: 'white' }}>{likedSongs.length} Songs • {totalTime}</Text>
                    </View>
                    <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 10 }}>
                        <Pressable style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center' }}>
                            <AntDesign name="arrowdown" size={20} color='white' />
                        </Pressable>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Pressable onPress={shufflePlay}>
                                <Entypo name="shuffle" size={24} color="#1DB954" /></Pressable>
                            <Pressable onPress={playSong}
                                style={{ width: 58, height: 58, borderRadius: 30, backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center' }}>
                                <Entypo name="controller-play" size={24} color="white" />
                            </Pressable>
                        </View>
                    </Pressable>
                    <FlatList showsVerticalScrollIndicator={false} data={searchedTracks} renderItem={({ item, index }) => (
                        <SongItem deleteFromFavorites={deleteFromFavorites} item={item} onPress={playSong} ind={index} isPlaying={item?.songID === audioPlayer?.currentTrack?.songID} />
                    )} />
                </View>
                {sortingModalVisible === true &&
                    <View style={styles.backdrop}>
                        <Pressable
                            style={styles.backdrop}
                            onPress={() => setSortingModalVisible(false)}
                        >
                            <View style={styles.bottomSheet}>
                                <Text style={{ fontSize: 25, fontWeight: 'bold', textAlign: 'center', color: 'white', marginBottom: 10 }}>Sort By</Text>
                                <Pressable style={{ flex: 1, flexDirection: 'row' }} onPress={() => sort(0)}>
                                    <Fontisto name={sortedBy === 0 ? 'radio-btn-active' : 'radio-btn-passive'} size={24} color='white' />
                                    <Text style={{ color: 'white', fontSize: 20, marginLeft: 10, fontWeight: '500' }}>Sort By Name</Text>
                                </Pressable>
                                <Pressable style={{ flex: 1, flexDirection: 'row' }} onPress={() => sort(1)}>
                                    <Fontisto name={sortedBy === 1 ? 'radio-btn-active' : 'radio-btn-passive'} size={24} color='white' />
                                    <Text style={{ color: 'white', fontSize: 20, marginLeft: 10, fontWeight: '500' }}>Sort By Length</Text>
                                </Pressable>
                                <Pressable style={{ flex: 1, flexDirection: 'row' }} onPress={() => sort(2)}>
                                    <Fontisto name={sortedBy === 2 ? 'radio-btn-active' : 'radio-btn-passive'} size={24} color='white' />
                                    <Text style={{ color: 'white', fontSize: 20, marginLeft: 10, fontWeight: '500' }}>Sort By Artist</Text>
                                </Pressable>
                                <Pressable style={{ flex: 1, flexDirection: 'row' }} onPress={() => sort(3)}>
                                    <Fontisto name={sortedBy === 3 ? 'radio-btn-active' : 'radio-btn-passive'} size={24} color='white' />
                                    <Text style={{ color: 'white', fontSize: 20, marginLeft: 10, fontWeight: '500' }}>Sort By Genre</Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </View>
                }
            </LinearGradient>
            <SongModal gapValue={25} />
        </>
    )
}

export default LikedSongsScreen

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        flex: 1,
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: "100%",
        height: '100%',
        justifyContent: 'flex-end'
    },
    bottomSheet: {
        width: '100%',
        height: '40%',
        backgroundColor: '#131624',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 20
    }
})