import { Image, Pressable, ScrollView, StyleSheet, Text, View, Modal, TextInput, Button } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { apiStart } from '../api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Entypo, AntDesign, FontAwesome, Feather } from '@expo/vector-icons';
import SongModal from '../SongModal';
import { AudioPlayer } from '../AudioPlayer';
import { usePlaylistsContext } from '../Playlists';
// This is the specific playlist page.
const Playlist = () => {
  const route = useRoute();
  const [tracks, setTracks] = useState([]);
  const [playlistLengthMessage, setPlaylistLengthMessage] = useState('');
  const navigation = useNavigation();
  const { audioPlayer, setAudioPlayer, updateQueueAndPlay, shuffleQueue } = useContext(AudioPlayer);
  const { playlists, setPlaylists } = usePlaylistsContext();
  const [playlistName, setPlaylistName] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [addPlaylistModalVisible, setAddPlaylistModalVisible] = useState(false);
  const [modalBorderColor, setModalBorderColor] = useState('gray');
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
          setPlaylistLengthMessage(`${tmp.length} Song${tmp.length === 1 ? '' : 's'} • ${formattedTotal}`);

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
    setPlaylistName(route?.params?.item?.name);
    setNewPlaylistName(route?.params?.item?.name);
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
          setPlaylistLengthMessage(`${route?.params?.item?.numberOfSongs} Song${route?.params?.item?.numberOfSongs === 1 ? '' : 's'} • ${formattedTotal}`);
        }).catch(e => { console.log(e); setPlaylistLengthMessage(`${route?.params?.item?.numberOfSongs} Song${route?.params?.item?.numberOfSongs === 1 ? '' : 's'}`); })
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
  const editPlaylist = () => {
    if (newPlaylistName === "") {
      setModalBorderColor('red');
      return;
    }
    setModalBorderColor('gray');
    if (newPlaylistName === playlistName) {
      setAddPlaylistModalVisible(false);
      return;
    }
    const api = `${apiStart}/Playlists/EditPlaylistName/PlaylistID/${route.params.item.id}/PlaylistName/${newPlaylistName}`;
    fetch(api, { method: "PUT", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
    .then(res => res.json())
    .then(res => {
      if (res && res.message && res.message === "Success!") {
        setPlaylistName(newPlaylistName);
        setAddPlaylistModalVisible(false);
        let tmp = [...playlists]
        for (i in tmp) {
          if (tmp[i].id === route.params.item.id) {
            tmp[i].name = newPlaylistName;
            break;
          }
        }
        setPlaylists([...tmp])
      }
    })
    .catch(error => console.log(error))
  };
  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <ScrollView>
        <Image style={{ position: 'absolute', width: '100%', height: 300 }} resizeMode='cover' blurRadius={10} source={{ uri: route.params.playlistImage }} />
        <View style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          height: 300
        }}></View>
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(19,22,36,1)']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 300,
            opacity: 0.5
          }}
        />
        <View style={{ height: 50 }}></View>
        <View style={{ flexDirection: 'row', padding: 12 }}>
          <Ionicons onPress={() => navigation.goBack()} name="arrow-back" size={24} color="white" />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Image style={{ width: 200, height: 200 }} source={{ uri: route.params.playlistImage }} />
          </View>
        </View>
        <Pressable style={{ position: 'absolute', top: 265, left: 20 }} onPress={()=>setAddPlaylistModalVisible(true)}>
          <Feather name='edit' size={24} color='#1DB954' />
        </Pressable>
        <View style={{ height: 40 }}></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ marginBottom: 10 }}>
            <Text style={{ color: 'white', marginHorizontal: 12, marginTop: 10, fontSize: 25, fontWeight: 'bold' }}>{playlistName}</Text>
            <View style={{ marginHorizontal: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 10, gap: 7 }}>
              <Text style={{ color: '#909090', fontSize: 14, fontWeight: 'bold' }}>{playlistLengthMessage}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginRight: 5 }}>
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
                <Pressable onPress={() => removeFromPlaylist(track?.songID)} style={{ marginRight: 5, justifyContent: 'center' }}>
                  <FontAwesome name='remove' size={24} color="white" />
                </Pressable>
              </Pressable>
            )) : <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 15 }}>This playlist is empty...</Text>}
          </View>
        </View>
      </ScrollView>
      {addPlaylistModalVisible === true && (
        <View style={{ flex: 1 }}>
          <Modal
            visible={addPlaylistModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setAddPlaylistModalVisible(false)}
          >
            <Pressable
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              onPress={() => setAddPlaylistModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <TextInput
                    style={{
                      height: 40,
                      borderColor: modalBorderColor ,
                      borderWidth: (modalBorderColor === "red") ? 3 : 1,
                      marginBottom: 10,
                      paddingHorizontal: 10,
                      color: 'black'
                    }}
                    placeholder="Enter new playlist name"
                    value={newPlaylistName}
                    onChangeText={setNewPlaylistName}
                  />
                  <Button title="Save" onPress={editPlaylist}></Button>
                </View>
              </View>
            </Pressable>
          </Modal>
        </View>
      )}
      <View style={{ height: audioPlayer.currentTrack == null ? 0 : 95 }}></View>
      <SongModal gapValue={25} />
    </LinearGradient>
  )
}

export default Playlist

const styles = StyleSheet.create({
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