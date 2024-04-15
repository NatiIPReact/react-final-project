import { StyleSheet, Text, View, ScrollView, Image, Pressable, Modal, TextInput, Button, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useGlobalState } from '../components/user';
import { apiStart } from '../api'
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import ProfilePicture from '../ProfilePicture';
import SongModal from '../SongModal';

const MyLibrary = () => {
  const navigation = useNavigation();
  const { user, setUser } = useGlobalState();
  const [playlists, setPlaylists] = useState([]);
  const [numberOfLikedSongs, setNumberOfLikedSongs] = useState(0);
  const [playlistName, setPlaylistName] = useState('');
  const [addPlaylistModalVisible, setAddPlaylistModalVisible] = useState(false);
  const [modalBorderColor, setModalBorderColor] = useState('gray');
  const getPlaylists = () => {
    const api = `${apiStart}/Playlists/GetUserPlaylists/UserID/${user.id}`;
    fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
      .then((res) => res.json())
      .then((res) => {
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
  useEffect(() => {
    getPlaylists();
    getNumberOfLikedSongs();
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
        navigation.navigate('Playlist', {
          item: item,
          playlistImage: playlistsImages[Math.floor(Math.random() * playlistsImages.length)]
        })
      })
      .catch(e => console.log(e));
    setModalBorderColor('black');
  };
  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <ScrollView style={{ marginTop: 50 }}>
        <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ProfilePicture name={user.name} />
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
                <Text style={{ color: 'white', marginTop: 7 }}>{numberOfLikedSongs} Songs</Text>
              </View>
            </View>
          </Pressable>
          {playlists.map((item, index) => (
            <Pressable onPress={() => navigation.navigate('Playlist', {
              item: item,
              playlistImage: playlistsImages[index % playlistsImages.length]
            })} key={item?.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 10 }}>
              <Image style={{ width: 50, height: 50, borderRadius: 4 }} source={{ uri: playlistsImages[index % playlistsImages.length] }} />
              <View>
                <Text style={{ color: 'white' }}>{item?.name}</Text>
                <Text style={{ color: 'white', marginTop: 7 }}>{item?.numberOfSongs} Songs</Text>
              </View>
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