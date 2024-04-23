import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { apiStart } from '../api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Entypo, AntDesign, FontAwesome } from '@expo/vector-icons';
import SongModal from '../SongModal';
import { AudioPlayer } from '../AudioPlayer';
import { usePlaylistsContext } from '../Playlists';

const Playlist = () => {
  const route = useRoute();
  const [tracks, setTracks] = useState([]);
  const [playlistLengthMessage, setPlaylistLengthMessage] = useState('');
  const navigation = useNavigation();
  const { audioPlayer, setAudioPlayer, updateQueueAndPlay, shuffleQueue } = useContext(AudioPlayer);
  const { playlists, setPlaylists } = usePlaylistsContext();
  const shufflePlay = () => {
    if (tracks.length === 0) {
      return;
    }
    shuffleQueue(tracks);
  };
  const removeFromPlaylist = (songID) => {
    const api = `${apiStart}/Playlists/DeleteSongFromPlaylist/PlaylistID/${route.params.item.id}/SongID/${songID}`;
    fetch(api, { method: "DELETE", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
      .then((res) => res.json())
      .then(res => {
        if (res.message === "Success!") {
          let tmp = [...tracks];
          for (i in tmp) {
            if (tmp[i].songID === songID) {
              tmp.splice(i, 1);
              break;
            }
          }
          setTracks([...tmp]);
          let totalSeconds = 0;
          for (song of tmp) {
            const s = song.length.split(':');
            totalSeconds += parseInt(s[0]) * 60 + parseInt(s[1]);
          }
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          const formattedTotal = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          setPlaylistLengthMessage(`${tmp.length} Songs • ${formattedTotal}`);

          let tmpPlaylists = [...playlists];
          for (p of tmpPlaylists) {
            if (p.id === route.params.item.id) {
              p.numberOfSongs--;
              break;
            }
          }
          setPlaylists([...tmpPlaylists]);
        }
      })
      .catch(e => console.log(e));
  }
  useEffect(() => {
    async function fetchPlaylistSongs() {
      const api = `${apiStart}/Playlists/GetPlaylistSongs/PlaylistID/${route.params.item.id}`;
      fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
        .then((res) => res.json())
        .then((res) => {
          setTracks(res);
          let totalSeconds = 0;
          for (song of res) {
            const tmp = song.length.split(':');
            totalSeconds += parseInt(tmp[0]) * 60 + parseInt(tmp[1]);
          }
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          const formattedTotal = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          setPlaylistLengthMessage(`${route?.params?.item?.numberOfSongs} Songs • ${formattedTotal}`);
        }).catch(e => { console.log(e); setPlaylistLengthMessage(`${route?.params?.item?.numberOfSongs} Songs`); })
    }
    fetchPlaylistSongs();
  }, []);
  const playSong = (songID = 0, ind = -1) => {
    if (tracks.length === 0) {
      return;
    }
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
  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <ScrollView style={{ marginTop: 50 }}>
        <View style={{ flexDirection: 'row', padding: 12 }}>
          <Ionicons onPress={() => navigation.goBack()} name="arrow-back" size={24} color="white" />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Image style={{ width: 200, height: 200 }} source={{ uri: route.params.playlistImage }} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{marginBottom:10}}>
            <Text style={{ color: 'white', marginHorizontal: 12, marginTop: 10, fontSize: 25, fontWeight: 'bold' }}>{route?.params?.item?.name}</Text>
            <View style={{ marginHorizontal: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 10, gap: 7 }}>
              <Text style={{ color: '#909090', fontSize: 14, fontWeight: 'bold' }}>{playlistLengthMessage}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable onPress={shufflePlay}>
              <Entypo name="shuffle" size={24} color="#1DB954" /></Pressable>
            <Pressable onPress={playSong}
              style={{ width: 58, height: 58, borderRadius: 30, backgroundColor: '#1DB954', justifyContent: 'center', alignItems: 'center' }}>
              <Entypo name="controller-play" size={24} color="white" />
            </Pressable>
          </View>
        </View>
        <View>
          <View style={{ marginTop: 10, marginHorizontal: 12 }}>
            {tracks.length > 0 ? tracks?.map((track, index) => (
              <Pressable onPress={() => { playSong(track?.songID, index) }} key={track?.songID} style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
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
                <Pressable onPress={() => removeFromPlaylist(track?.songID)}>
                  <FontAwesome name='remove' size={24} color="white" />
                </Pressable>
              </Pressable>
            )) : <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 15 }}>This playlist is empty...</Text>}
          </View>
        </View>
      </ScrollView>
      <SongModal gapValue={25} />
      <View style={{height:audioPlayer.currentTrack == null ? 0 : 95}}></View>
    </LinearGradient>
  )
}

export default Playlist

const styles = StyleSheet.create({})