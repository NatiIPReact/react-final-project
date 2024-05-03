import { StyleSheet, Text, View, Image, Pressable, TextInput, TouchableOpacity, Linking } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useRoute } from '@react-navigation/native';
import { AudioPlayer } from '../AudioPlayer';
import { ScrollView } from 'react-native';
import { apiStart } from '../api';
import { Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import { useGlobalState } from '../components/user';
import SongModal from '../SongModal';
import { Button } from '@rneui/themed';

const Artist = () => {
    const { user, setUser } = useGlobalState();
    const route = useRoute();
    const [tracks, setTracks] = useState([]);
    const [artistLengthMessage, setArtistLengthMessage] = useState('');
    const navigation = useNavigation();
    const { audioPlayer, setAudioPlayer, updateQueueAndPlay, shuffleQueue, handlePlayPause } = useContext(AudioPlayer);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followers, setFollowers] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [commentErrorMessage, setCommentErrorMessage] = useState('');
    const [commentTextInputBorderColor, setCommentTextInputBorderColor] = useState('transparent');
    const [concerts, setConcerts] = useState([]);
    const [instagram, setInstagram] = useState('');
    useEffect(() => {
        async function fetchArtistSongs() {
            const api = `${apiStart}/Songs/GetPerformerSongs/PerformerID/${route?.params?.item?.performerID}/UserID/${user?.id}`;
            fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
                .then((res) => res.json())
                .then((res) => {
                    if (res.length > 0)
                        setIsFollowing(res[0]?.isUserFollowingArtist === 1 ? true : false);
                    setTracks(res);
                    let totalSeconds = 0;
                    for (song of res) {
                        const tmp = song.songLength.split(':');
                        totalSeconds += parseInt(tmp[0]) * 60 + parseInt(tmp[1]);
                    }
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = totalSeconds % 60;
                    const formattedTotal = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                    setArtistLengthMessage(`${res.length} Songs • ${formattedTotal}`);
                }).catch(e => console.log(e))
        }
        fetchArtistSongs();
        getNumberOfFollowers();
        getArtistComments();
        getArtistConcerts();
        getArtistInstagramHandle();
    }, []);
    const getArtistInstagramHandle = () => {
        const api = `${apiStart}/Performers/GetPerformerInstagram/PerformerID/${route?.params?.item?.performerID}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => res.json())
            .then(res => {
                if (res?.instagram)
                    setInstagram(res?.instagram);
            }).catch(err => console.log(err))
    };
    const getArtistConcerts = () => {
        fetch(`https://app.ticketmaster.com/discovery/v2/events.json?keyword=${route?.params?.item?.performerName}&apikey=sGS4leVOIAuCcazajk6HxuSuvPhcaoCu`,
            { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => res.json())
            .then(res => {
                let tmp = [];
                if (res != undefined && undefined != res._embedded && res._embedded.events != undefined) {
                    for (e of res._embedded.events) {
                        if (e != undefined && e.name != undefined && e.dates != undefined && e.dates.start != undefined &&
                            e.dates.start.localTime != undefined && e._embedded != undefined &&
                            e._embedded.venues != undefined && e._embedded.venues[0] != undefined &&
                            e._embedded.venues[0].country != undefined && e._embedded.venues[0].country.name != undefined &&
                            e._embedded.venues[0].city != undefined && e._embedded.venues[0].city.name != undefined &&
                            e.classifications != undefined && e.classifications[0] != undefined &&
                            e.classifications[0].genre != undefined && e.classifications[0].genre.name != undefined &&
                            e.url != undefined) {
                            let event = {
                                name: e?.name,
                                date: e?.dates?.start?.localTime,
                                location: `${e?._embedded?.venues[0]?.country?.name}, ${e?._embedded?.venues[0]?.city?.name}`,
                                genre: e?.classifications[0]?.genre?.name,
                                url: e?.url
                            };
                            tmp.push(event);
                        }
                    }
                    setConcerts([...tmp]);
                }
            }).catch(e => console.log(e))
    };
    const getNumberOfFollowers = () => {
        const api = `${apiStart}/Performers/GetTotalFollowersOfPerformer/PerformerID/${route?.params?.item?.performerID}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => res.json())
            .then(res => {
                setFollowers(res?.totalFollowers)
            }).catch(e => console.log(e));
    };
    const shufflePlay = () => {
        shuffleQueue(tracks);
    };
    const playSong = (songID = 0, ind = -1) => {
        if (ind === -1) {
            updateQueueAndPlay(tracks[0].songID, tracks, 0);
            return;
        }
        if (tracks[ind].songID === songID)
            updateQueueAndPlay(songID, tracks, ind);
        else {
            for (i in tracks) {
                if (tracks[i].songID === songID) {
                    updateQueueAndPlay(songID, tracks, i);
                    break;
                }
            }
        }
    };
    const followArtist = () => {
        const api = `${apiStart}/Users/FollowArtist/UserID/${user?.id}/PerformerID/${route?.params?.item?.performerID}`;
        fetch(api, { method: "POST", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                setIsFollowing(true);
                setFollowers(prevState => prevState + 1);
            }).catch(e => console.log(e));
    };
    const unfollowArtist = () => {
        const api = `${apiStart}/Users/UnfollowArtist/UserID/${user?.id}/PerformerID/${route?.params?.item?.performerID}`;
        fetch(api, { method: "DELETE", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                setIsFollowing(false);
                setFollowers(prevState => prevState - 1);
            }).catch(e => console.log(e));
    };
    const images = ['https://bootdey.com/img/Content/user_1.jpg', 'https://bootdey.com/img/Content/user_2.jpg'
        , 'https://bootdey.com/img/Content/user_3.jpg'];
    const getArtistComments = () => {
        const api = `${apiStart}/Comments/GetArtistsComments/PerformerID/${route?.params?.item?.performerID}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => res.json())
            .then(res => {
                for (i of res) {
                    if (i.userImage == null)
                        i.randomImage = images[Math.floor(Math.random() * images.length)];
                }
                setComments(res);
            }).catch(e => console.log(e));
    };
    const uploadComment = () => {
        if (commentInput === "") {
            setCommentTextInputBorderColor('red');
            return;
        }
        setCommentTextInputBorderColor('transparent');
        if (isFollowing === false) {
            setCommentErrorMessage('Only followers can comment!');
            return;
        }
        setCommentErrorMessage('');
        const api = `${apiStart}/Comments`;
        let commentToPost = {
            "commentID": 0,
            "userID": user?.id,
            "performerID": route?.params?.item?.performerID,
            "content": commentInput,
            "userName": user?.name,
            'date': (new Date()).toISOString(),
            'userImage': ''
        };
        fetch(api, { method: "POST", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }), body: JSON.stringify(commentToPost) })
            .then(res => res.json())
            .then(res => {
                if (res != undefined && res.message != undefined && res.message === "Success") {
                    commentToPost.userImage = user?.image;
                    if (commentToPost.userImage == null)
                        commentToPost.randomImage = images[Math.floor(Math.random() * images.length)];
                    setComments([...comments, commentToPost]);
                    setCommentInput('');
                }
            }).catch(e => console.log(e));
    };
    const buyConcertTickets = (index) => {
        if (concerts.length > index && index >= 0) {
            Linking.openURL(concerts[index]?.url);
        }
    };
    const openInstagram = async () => {
        if (audioPlayer?.isPlaying === true) {
            await handlePlayPause();
        }
        const url = `https://www.instagram.com/${instagram}`;
        Linking.openURL(url);
    };
    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <ScrollView style={{ marginTop: 50 }}>
                <View style={{ flexDirection: 'row', padding: 12 }}>
                    <Ionicons onPress={() => navigation.goBack()} name="arrow-back" size={24} color="white" />
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Image style={{ width: 200, height: 200 }} source={{ uri: route?.params?.item?.performerImage }} />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ color: 'white', marginHorizontal: 12, marginTop: 10, fontSize: 25, fontWeight: 'bold' }}>{route?.params?.item?.performerName}</Text>
                        <View style={{ marginHorizontal: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 10, gap: 7 }}>
                            <Text style={{ color: '#909090', fontSize: 14, fontWeight: 'bold' }}>{artistLengthMessage} • {followers} Followers</Text>
                        </View>
                    </View>
                    <Pressable style={{ marginRight: 30 }} onPress={openInstagram}>
                        <Entypo name="instagram" size={24} color="white" />
                    </Pressable>
                </View>
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 10 }}>
                    <Pressable style={{ backgroundColor: '#282828', padding: 10, borderRadius: 30 }} onPress={isFollowing ? unfollowArtist : followArtist}>
                        <Text style={{ fontSize: 15, color: 'white' }}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
                    </Pressable>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Pressable onPress={shufflePlay}>
                            <Entypo name="shuffle" size={24} color="#1DB954" />
                        </Pressable>
                        <Pressable onPress={playSong}
                            style={{ width: 58, height: 58, borderRadius: 30, backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center' }}>
                            <Entypo name="controller-play" size={24} color="white" />
                        </Pressable>
                    </View>
                </Pressable>
                <View>
                    <View style={{ marginTop: 10, marginHorizontal: 12 }}>
                        {tracks?.map((track, index) => (
                            <Pressable onPress={() => { playSong(track?.songID, index) }} key={track?.songID} style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Image source={{ uri: track?.performerImage }}
                                        style={{ width: 50, height: 50, borderRadius: 3 }} />
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500', color: audioPlayer?.currentTrack?.songID === track?.songID ? "#3FFF00" : "white" }}>{track?.songName}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                                            <Text style={{ color: 'gray', fontSize: 16, fontWeight: '500' }}>{track?.performerName}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={{ fontSize: 16, fontWeight: '500', color: "gray" }}>{track?.songLength}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
                <View>
                    <View style={{ marginTop: 10, marginHorizontal: 12 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20, marginBottom: 15 }}>{comments.length} Comments</Text>
                        {comments?.map((comment, index) => (
                            <View key={index} style={{ flex: 1, flexDirection: 'row', marginBottom: 10 }}>
                                <Image source={{ uri: comment?.userImage == null ? comment?.randomImage : `data:image/jpeg;base64,${comment?.userImage}` }}
                                    style={{ width: 50, height: 50, borderRadius: 3, marginRight: 10 }} />
                                <View>
                                    <Text style={{ color: 'white', fontWeight: '500' }}>{comment?.date?.split('T')[0]}{" "}
                                        {<Text style={{ color: '#3bc8e7', fontWeight: 'bold' }}>{comment?.userName}</Text>} says:</Text>
                                    <Text style={{ color: 'white', fontWeight: '500' }}>{comment?.content}</Text>
                                </View>
                            </View>
                        ))}
                        {comments.length === 0 && <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 20 }}>No comments yet.. be the first to comment!</Text>}
                        <View style={{ marginTop: 10, alignItems: 'center' }}>
                            <Text style={{ color: 'red', fontSize: 18, fontWeight: '500', marginBottom: 5 }}>{commentErrorMessage}</Text>
                            <TextInput
                                style={{
                                    height: 50,
                                    backgroundColor: 'white',
                                    marginBottom: 20,
                                    paddingHorizontal: 10,
                                    borderRadius: 5,
                                    width: '100%',
                                    fontSize: 16,
                                    borderWidth: 2,
                                    borderColor: commentTextInputBorderColor
                                }}
                                placeholder="Add comment"
                                placeholderTextColor="#003f5c"
                                onChangeText={(newCommentInput) => setCommentInput(newCommentInput)}
                                value={commentInput}
                                autoCapitalize="none"
                                autoCorrect={false} />
                            <TouchableOpacity style={styles.loginButton} onPress={uploadComment}>
                                <Text style={styles.buttonText}>Comment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 25, marginBottom: 15, marginTop: 10, marginLeft: 10 }}>Related Concerts</Text>
                    {concerts.length === 0 && <Text style={{ color: 'white', textAlign: 'center', fontWeight: '500', fontSize: 20 }}>No concerts soon...</Text>}
                    {concerts?.map((concert, index) => (
                        <View key={index} style={{ flex: 1, marginBottom: 10, marginLeft: 13 }}>
                            <View>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>{index + 1}. {concert?.name}</Text>
                                <Text style={{ color: 'white', fontWeight: '500' }}>{concert?.location} @ {concert?.date}</Text>
                                <Text style={{ color: 'white', fontWeight: '500' }}>Genre: {concert?.genre}</Text>
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Button onPress={() => buyConcertTickets(index)}
                                    ViewComponent={LinearGradient} // Don't forget this!
                                    linearGradientProps={{
                                        colors: ["#FF9800", "#F44336"],
                                        start: { x: 0, y: 0.5 },
                                        end: { x: 1, y: 0.5 },
                                    }} radius={4}
                                >
                                    Buy Tickets
                                </Button>
                            </View>
                        </View>
                    ))}
                </View>
                <View style={{ height: (audioPlayer?.currentTrack == null) ? 15 : 100 }}></View>
            </ScrollView>
            <SongModal gapValue={25} />
        </LinearGradient>
    )
}

export default Artist

const styles = StyleSheet.create({
    loginButton: {
        backgroundColor: '#007bff',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
        width: '50%',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    }
})