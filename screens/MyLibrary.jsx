import { StyleSheet, Text, View, ScrollView, Image, Pressable, Modal, TextInput, Button, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useGlobalState } from '../components/user';
import { apiStart } from '../api'
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Ionicons, FontAwesome } from '@expo/vector-icons';
import ProfilePicture from '../ProfilePicture';
import SongModal from '../SongModal';
import { usePlaylistsContext } from '../Playlists';
import { useLikedSongsContext } from '../LikedSongs';
import { useRecentlyPlayedContext } from '../RecentlyPlayed';
// This is the my library page
const MyLibrary = () => {
  const navigation = useNavigation();
  const { user, setUser } = useGlobalState();
  const { playlists, setPlaylists } = usePlaylistsContext();
  //const [numberOfLikedSongs, setNumberOfLikedSongs] = useState(0);
  const [playlistName, setPlaylistName] = useState('');
  const [addPlaylistModalVisible, setAddPlaylistModalVisible] = useState(false);
  const [modalBorderColor, setModalBorderColor] = useState('gray');
  const {likedSongs, setLikedSongs} = useLikedSongsContext();
  const {recentlyPlayed, setRecentlyPlayed} = useRecentlyPlayedContext();
  //const [numberOfRecentlyPlayed, setNumberOfRecentlyPlayed] = useState(0);
  const getPlaylists = () => {
    const api = `${apiStart}/Playlists/GetUserPlaylists/UserID/${user.id}`;
    fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
      .then((res) => res.json())
      .then((res) => {
        if (res != undefined && res.message != undefined && res.message.toLowerCase().includes('error')) return;
        setPlaylists(res);
      }).catch((err) => console.log(err));
  };
  const getNumberOfLikedSongs = async () => {
    const api = `${apiStart}/Users/GetNumberOfLikedSongs/UserID/${user.id}`;
    fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
      .then((res) => res.json())
      .then((res) => {
        setNumberOfLikedSongs(res.totalLikedSongs);
      }).catch((err) => console.log(err));
  };
  const getNumberOfRecentlyPlayed = async () => {
    const api = `${apiStart}/Users/GetNumberOfRecentlyPlayed/UserID/${user.id}`;
    fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
      .then((res) => res.json())
      .then((res) => {
        setNumberOfRecentlyPlayed(res.totalRecentlyPlayed);
      }).catch((err) => console.log(err));
  };
  useEffect(() => {
    getPlaylists();
    //getNumberOfRecentlyPlayed();
    //getNumberOfLikedSongs();
    //getLikedSongs();
  }, []);
  const addPlaylist = () => {
    setAddPlaylistModalVisible(true);
  };
  const playlistsImages = ['https://images.pexels.com/photos/534283/pexels-photo-534283.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3771842/pexels-photo-3771842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'];
  const savePlaylist = () => {
    if (playlistName === "") {
      setModalBorderColor('red');
      return;
    }
    const api = `${apiStart}/Playlists`;
    let requestBody = {
      "id": 0,
      "name": playlistName,
      "userID": user.id
    };
    fetch(api, { method: "POST", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }), body: JSON.stringify(requestBody) })
      .then(res => res.json())
      .then(res => {
        setAddPlaylistModalVisible(false);
        let item = { id: res.playlistID, name: playlistName, numberOfSongs: 0 }
        setPlaylists([...playlists, item]);
        navigation.navigate('Playlist', {
          item: item,
          playlistImage: playlistsImages[Math.floor(Math.random() * playlistsImages.length)]
        })
      })
      .catch(e => console.log(e));
    setModalBorderColor('black');
  };
  const deletePlaylist = (playlistToDelete) => {
    const api = `${apiStart}/Playlists/DeleteUserPlaylist/PlaylistID/${playlistToDelete.id}/UserID/${user.id}`;
    fetch(api, { method: "DELETE", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
      .then((res) => res.json())
      .then(res => {
        let tmp = [...playlists];
        for (i in tmp) {
          if (tmp[i].id === playlistToDelete.id) {
            tmp.splice(i, 1)
            break;
          }
        }
        setPlaylists([...tmp]);
      }).catch(e => console.log(e));
  };
  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <ScrollView style={{ marginTop: 50 }}>
        <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {(user !== undefined && (user?.image == null || user?.image == "")) ? <ProfilePicture name={user?.name} /> : <Image source={{ uri: `data:image/jpeg;base64,${user.image}` }} style={{ width: 65, height: 65, borderRadius: 50 }} />}
            <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 'bold', color: 'white' }}>Your Library</Text>
          </View>
          <Pressable onPress={addPlaylist}>
            <Ionicons name="add" size={45} color='white' />
          </Pressable>
        </View>
        <View style={{ padding: 15 }}>
          <Pressable onPress={() => navigation.navigate('Liked')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 10 }}>
            <Image style={{ width: 70, height: 70, borderRadius: 4 }} source={{ uri: 'https://i1.sndcdn.com/artworks-y6qitUuZoS6y8LQo-5s2pPA-t500x500.jpg' }} />
            <View>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Liked Songs</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AntDesign name="pushpin" size={18} color="green" />
                <Text style={{ color: 'white', marginTop: 7 }}>{likedSongs?.length || 0} Songs</Text>
              </View>
            </View>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('SongHistory')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 10 }}>
            <Image style={{ width: 70, height: 70, borderRadius: 4 }} source={{ uri: 'https://s26162.pcdn.co/wp-content/uploads/2019/09/book-with-music-notes-1068x715.jpg' }} />
            <View>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Recently Played</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AntDesign name="pushpin" size={18} color="green" />
                <Text style={{ color: 'white', marginTop: 7 }}>{recentlyPlayed?.length || 0} Songs</Text>
              </View>
            </View>
          </Pressable>
          {playlists.map((item, index) => (
            <Pressable key={item?.id} onPress={() => navigation.navigate('Playlist', {
              item: item,
              playlistImage: playlistsImages[index % playlistsImages.length]
            })} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 10, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image style={{ width: 50, height: 50, borderRadius: 4 }} source={{ uri: playlistsImages[index % playlistsImages.length] }} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ color: 'white' }}>{item?.name}</Text>
                  <Text style={{ color: 'white', marginTop: 7 }}>{item?.numberOfSongs} Songs</Text>
                </View>
              </View>
              <Pressable onPress={() => deletePlaylist(item)}>
                <FontAwesome name='remove' size={24} color="white" />
              </Pressable>
            </Pressable>
          ))}
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
                      borderColor: { modalBorderColor },
                      borderWidth: (modalBorderColor === "red") ? 3 : 1,
                      marginBottom: 10,
                      paddingHorizontal: 10,
                      color: 'black'
                    }}
                    placeholder="Enter playlist name"
                    value={playlistName}
                    onChangeText={setPlaylistName}
                  />
                  <Button title="Add" onPress={savePlaylist}></Button>
                </View>
              </View>
            </Pressable>
          </Modal>
        </View>
      )}
      <SongModal gapValue={85} />
    </LinearGradient>
  )
}

export default MyLibrary

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