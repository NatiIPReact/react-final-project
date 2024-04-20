import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { apiStart } from '../api'
import { FlatList } from 'react-native'
import SongCard from '../components/SongCard'
import TopArtistCard from '../components/TopArtistCard'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { useGlobalState } from '../components/user'
import ProfilePicture from '../ProfilePicture'
import SongModal from '../SongModal'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import { AudioPlayer } from '../AudioPlayer'
import { usePlaylistsContext } from '../Playlists'
import registerForPushNotificationsAsync from '../NotificationComponent'
import { useLikedSongsContext } from '../LikedSongs'

const HomeScreen = () => {
    const [featuredSongs, setFeaturedSongs] = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const { audioPlayer, setAudioPlayer, playRadioStation } = useContext(AudioPlayer);
    const { user, setUser } = useGlobalState();
    const [message, setMessage] = useState('');
    const navigation = useNavigation();
    const {playlists, setPlaylists} = usePlaylistsContext();
    const {likedSongs, setLikedSongs} = useLikedSongsContext();
    //const [playlists, setPlaylists] = useState([]);
    const getUser = async () => {
        try {
            const userAsJSON = await AsyncStorage.getItem('@user');
            if (userAsJSON == null) {
                navigation.navigate("Login");
                return;
            }
            setUser(JSON.parse(userAsJSON));
        } catch (e) {
            navigation.navigate("Login");
        }
    }
    const getFeaturedSongs = async () => {
        const url = `${apiStart}/Songs/GetTop15?UserID=${user.id}`;
        fetch(url, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => { return res.json(); }).then((res) => {
                setFeaturedSongs(res);
            }).catch((err) => console.log(err));
    }
    const getTopArtists = async () => {
        const url = `${apiStart}/Performers/GetFeaturedArtists`;
        fetch(url, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => { return res.json(); }).then((res) => {
                setTopArtists(res);
            }).catch((err) => console.log(err));
    }
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
        getUser();
    }, []);
    useEffect(() => {
        if (user) {
            setMessage(greetingMessage());
            getFeaturedSongs();
            getTopArtists();
            getPlaylists();
            registerForPushNotificationsAsync();
            getLikedSongs();
        }
    }, [user]);
    const greetingMessage = () => {
        const currentTime = new Date().getHours();
        if (currentTime < 12) {
            return `Good Morning${user.name ? ", " + user.name : ""}`;
        } else if (currentTime < 16) {
            return `Good Afternoon${user.name ? ", " + user.name : ""}`;
        } else { return `Good Evening${user.name ? ", " + user.name : ""}` }
    };
    const getPlaylists = () => {
        const api = `${apiStart}/Playlists/GetUserPlaylists/UserID/${user?.id}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                if (res != undefined && res.message != undefined && res.message.toLowerCase().includes('error')) return;
                setPlaylists(res);
            }).catch((err) => console.log(err));
    };
    const playlistsImages = ['https://images.pexels.com/photos/534283/pexels-photo-534283.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        'https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/3771842/pexels-photo-3771842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'];
    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <ScrollView style={{ marginTop: 50 }}>
                <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {(user !== undefined && (user?.image == null || user?.image == "")) ? <ProfilePicture name={user?.name} /> : <Image source={{ uri: `data:image/jpeg;base64,${user?.image}` }} style={{  width: 65,height: 65,borderRadius: 50 }}/>}
                        <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 'bold', color: 'white' }}>{message}</Text>
                    </View>
                </View>
                <View style={{ height: 10 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Pressable onPress={() => navigation.navigate('Liked')} style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginHorizontal: 10, marginVertical: 8, backgroundColor: '#202020', borderRadius: 4, elevation: 3 }}>
                        <LinearGradient colors={['#33006F', '#FFFFFF']}>
                            <Pressable onPress={() => navigation.navigate('Liked')} style={{ width: 55, height: 55, justifyContent: 'center', alignItems: 'center' }}>
                                <AntDesign name='heart' size={24} color='white' />
                            </Pressable>
                        </LinearGradient>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Liked Songs</Text>
                    </Pressable>
                    <Pressable onPress={() => navigation.navigate('Quiz')} style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginHorizontal: 10, marginVertical: 8, backgroundColor: '#202020', borderRadius: 4, elevation: 3 }}>
                        <LinearGradient colors={['#00568f', '#FFFFFF']}>
                            <Pressable onPress={() => navigation.navigate('Quiz')} style={{ width: 55, height: 55, justifyContent: 'center', alignItems: 'center' }}>
                                <MaterialIcons name='quiz' size={24} color='white' />
                            </Pressable>
                        </LinearGradient>
                        <View>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Quizzes</Text>
                        </View>
                    </Pressable>
                </View>
                <Text style={{ color: 'white', fontSize: 19, fontWeight: 'bold', marginHorizontal: 10, marginTop: 10 }}>Featured Songs</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>{featuredSongs.map((item, index) => (
                    <SongCard item={item} key={index} />
                ))}</ScrollView>
                <View style={{ height: 10 }} />
                <Text style={{ color: 'white', fontSize: 19, fontWeight: 'bold', marginHorizontal: 10, marginTop: 10 }}>
                    Top Aritsts
                </Text>
                <FlatList horizontal showsHorizontalScrollIndicator={false} data={topArtists} renderItem={({ item, index }) => <TopArtistCard item={item} key={index} />} />
                <Text style={{ color: 'white', fontSize: 19, fontWeight: 'bold', marginHorizontal: 10, marginTop: 10 }}>
                    Live Radio
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Pressable style={{ margin: 10 }} onPress={()=>playRadioStation(0)}>
                        <Image style={{ width: 130, height: 130, borderRadius: 5 }} source={{ uri: 'https://i.imgur.com/IdLpgkF_d.webp?maxwidth=760&fidelity=grand' }} />
                        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '500', color: 'white', marginTop: 10 }}>Kids</Text>
                    </Pressable>
                    <Pressable style={{ margin: 10 }} onPress={()=>playRadioStation(1)}>
                        <Image style={{ width: 130, height: 130, borderRadius: 5 }} source={{ uri: 'https://freerangestock.com/sample/64357/pop-music-means-sound-track-and-melodies.jpg' }} />
                        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '500', color: 'white', marginTop: 10 }}>German Pop</Text>
                    </Pressable>
                    <Pressable style={{ margin: 10 }} onPress={()=>playRadioStation(2)}>
                        <Image style={{ width: 130, height: 130, borderRadius: 5 }} source={{ uri: 'https://static.mytuner.mobi/media/tvos_radios/q8ne5lhjxbcf.jpg' }} />
                        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '500', color: 'white', marginTop: 10 }}>German Music</Text>
                    </Pressable>
                    <Pressable style={{ margin: 10 }} onPress={()=>playRadioStation(3)}>
                        <Image style={{ width: 130, height: 130, borderRadius: 5 }} source={{ uri: 'https://static.mytuner.mobi/media/tvos_radios/mmvGSBqcQB.png' }} />
                        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '500', color: 'white', marginTop: 10 }}>Dance</Text>
                    </Pressable>
                    <Pressable style={{ margin: 10 }} onPress={()=>playRadioStation(4)}>
                        <Image style={{ width: 130, height: 130, borderRadius: 5 }} source={{ uri: 'https://www.radio.net/images/broadcasts/81/9d/104930/2/c300.png' }} />
                        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '500', color: 'white', marginTop: 10 }}>Kids</Text>
                    </Pressable>
                    <Pressable style={{ margin: 10 }} onPress={()=>playRadioStation(5)}>
                        <Image style={{ width: 130, height: 130, borderRadius: 5 }} source={{ uri: 'https://i.imgur.com/WWn5XN8_d.webp?maxwidth=760&fidelity=grand' }} />
                        <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '500', color: 'white', marginTop: 10 }}>Pop</Text>
                    </Pressable>
                </ScrollView>
                <Text style={{ color: 'white', fontSize: 19, fontWeight: 'bold', marginHorizontal: 10, marginTop: 10 }}>
                    Your Playlists
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {playlists.map((item, index) => (
                        <Pressable style={{ margin: 10 }} onPress={() => navigation.navigate('Playlist', {
                            item: item,
                            playlistImage: playlistsImages[index % playlistsImages.length]
                        })} key={item?.id}>
                            <Image style={{ width: 130, height: 130, borderRadius: 5 }} source={{ uri: playlistsImages[index % playlistsImages.length] }} />
                            <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: '500', color: 'white', marginTop: 10 }}>{item?.name}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
                <View style={{ height: 100 }}></View>
            </ScrollView>
            <SongModal gapValue={85} />
        </LinearGradient>
    )
}

export default HomeScreen

const styles = StyleSheet.create({})