import { StyleSheet, Text, View, Image, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useGlobalState } from '../components/user'
import { apiStart } from '../api'
import { ScrollView } from 'react-native'
import ProfilePicture from '../ProfilePicture'
import AsyncStorage from '@react-native-async-storage/async-storage';
import SongModal from '../SongModal'
import { useNavigation } from '@react-navigation/native'
import { usePlaylistsContext } from '../Playlists'

const ProfileScreen = () => {
  const { user, setUser } = useGlobalState();
  const navigation = useNavigation();
  //const [playlists, setPlaylists] = useState([]);
  const {playlists, setPlaylists} = usePlaylistsContext();
  useEffect(() => {
    const api = `${apiStart}/Playlists/GetUserPlaylists/UserID/${user.id}`;
    fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
      .then((res) => res.json())
      .then((res) => {
        setPlaylists(res);
      }).catch((err) => console.log(err));
  }, []);
  const playlistsImages = ['https://images.pexels.com/photos/534283/pexels-photo-534283.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3771842/pexels-photo-3771842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'];
  const logout = async () => {
    await AsyncStorage.removeItem('@user', () => { navigation.navigate("Login") });
  };
  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <ScrollView style={{ marginTop: 50 }}>
        <View style={{ padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {(user !== undefined && user.image == null) ? <ProfilePicture name={user?.name} /> : <Image source={{ uri: `data:image/jpeg;base64,${user.image}` }} style={{  width: 65,height: 65,borderRadius: 50 }}/>}
            <View>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{user?.name}</Text>
              <Text style={{ color: 'gray', fontSize: 16, fontWeight: 'bold' }}>Member since {user?.registrationDate.split('-')[0]}</Text>
            </View>
          </View>
        </View>
        <View style={{marginHorizontal:12,marginVertical:5,flexDirection:'row',alignItems:'center',gap:10}}>
        <Pressable onPress={()=>navigation.navigate('EditProfile')} style={{backgroundColor:'#282828',padding:10,borderRadius:30}}>
            <Text style={{fontSize:15,color:'white'}}>Edit Profile</Text>
          </Pressable>
          <Pressable onPress={()=>navigation.navigate('ContactUs')} style={{backgroundColor:'#282828',padding:10,borderRadius:30}}>
            <Text style={{fontSize:15,color:'white'}}>Contact Us</Text>
          </Pressable>
          <Pressable onPress={logout} style={{backgroundColor:'#282828',padding:10,borderRadius:30}}>
            <Text style={{fontSize:15,color:'white'}}>Logout</Text>
          </Pressable>
        </View>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginHorizontal: 12 }}>Your Playlists</Text>
        <View style={{ padding: 15 }}>
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
      <SongModal gapValue={85} />
    </LinearGradient>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({})