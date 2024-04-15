import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { apiStart } from '../api';
import { LinearGradient } from 'expo-linear-gradient';
import {Ionicons,Entypo,AntDesign} from '@expo/vector-icons';
import SongModal from '../SongModal';
import { AudioPlayer } from '../AudioPlayer';

const Playlist = () => {
  const route = useRoute();
  const [tracks, setTracks] = useState([]);
  const [playlistLengthMessage, setPlaylistLengthMessage] = useState('');
  const navigation = useNavigation();
  const {audioPlayer, setAudioPlayer,updateQueueAndPlay,shuffleQueue} = useContext(AudioPlayer);
  const shufflePlay = () => {
    if (tracks.length === 0) {
      return;
    }
    shuffleQueue(tracks);
  };
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
      }).catch(e => {console.log(e); setPlaylistLengthMessage(`${route?.params?.item?.numberOfSongs} Songs`);})
    }
    fetchPlaylistSongs();
  },[]);
  const playSong = (songID = 0, ind = -1) => {
    if (tracks.length === 0) {
      return;
    }
    if (ind === -1) {
      updateQueueAndPlay(tracks[0].songID, tracks,0);
      return;
  }
  if (tracks[ind].songID === songID)
      updateQueueAndPlay(songID,tracks,ind);
  else {
      for (i in tracks) {
          if (tracks[i].songID === songID) {
              updateQueueAndPlay(songID,tracks,i);
              break;
          }
      }
  }
  };
  return (
    <LinearGradient colors={["#040306","#131624"]} style={{flex:1}}>
      <ScrollView style={{marginTop:50}}>
        <View style={{flexDirection:'row',padding:12}}>
          <Ionicons onPress={() => navigation.goBack()} name="arrow-back" size={24} color="white" />
          <View style={{flex:1,alignItems:'center'}}>
            <Image style={{width:200,height:200}} source={{uri:route.params.playlistImage}} />
          </View>
        </View>
        <Text style={{color:'white',marginHorizontal:12,marginTop:10,fontSize:25,fontWeight:'bold'}}>{route?.params?.item?.name}</Text>
        <View style={{marginHorizontal:12,flexDirection:'row',alignItems:'center',flexWrap:'wrap',marginTop:10,gap:7}}>
          <Text style={{color:'#909090',fontSize:14,fontWeight:'bold'}}>{playlistLengthMessage}</Text>
        </View>
        <Pressable style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginHorizontal:10}}>
                    <Pressable style={{width:30,height:30,borderRadius:15,backgroundColor:'#1DB954',justifyContent:'center',alignItems:'center'}}>
                        <AntDesign name="arrowdown" size={20} color='white'/>
                    </Pressable>
                    <View style={{flexDirection:'row',alignItems:'center',gap:10}}>
                        <Pressable onPress={shufflePlay}>
                        <Entypo name="shuffle" size={24} color="#1DB954"/></Pressable>
                        <Pressable onPress={playSong}
                        style={{width:58,height:58,borderRadius:30,backgroundColor:'#1DB954',justifyContent:'center',alignItems:'center'}}>
                        <Entypo name="controller-play" size={24} color="white"/>
                        </Pressable>
                    </View>
                </Pressable>
        <View>
          <View style={{marginTop:10,marginHorizontal:12}}>
            {tracks.length > 0 ? tracks?.map((track,index) => (
              <Pressable onPress={()=>{playSong(track?.songID,index)}} key={track?.songID} style={{marginVertical:10,flexDirection:'row',justifyContent:'space-between'}}>
                <View style={{flexDirection:'row'}}>
                <Image source={{uri:track?.performerImage}}
                style={{width:50,height:50,borderRadius:3}} />
                <View style={{marginLeft:10}}>
                  <Text style={{fontSize:16,fontWeight:'500',color:audioPlayer?.currentTrack?.songID===track?.songID?"#3FFF00":"white"}}>{track?.songName}</Text>
                  <View style={{flexDirection:'row',alignItems:'center',gap:8,marginTop:5}}>
                    <Text style={{color:'gray',fontSize:16,fontWeight:'500'}}>{track?.performerName} • {track?.genreName}</Text>
                  </View>
                </View>
                </View>
                <Text style={{fontSize:16,fontWeight:'500',color:"gray"}}>{track?.length}</Text>
              </Pressable>
            )) : <Text style={{color:'white',fontSize:20,fontWeight:'bold',textAlign:'center',marginTop:15}}>This playlist is empty...</Text>}
          </View>
        </View>
      </ScrollView>
        <SongModal gapValue={25} />
    </LinearGradient>
  )
}

export default Playlist

const styles = StyleSheet.create({})