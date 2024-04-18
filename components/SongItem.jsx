import { StyleSheet, Text, View, Pressable, Image } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { AntDesign, Entypo } from '@expo/vector-icons'
import { AudioPlayer } from '../AudioPlayer';

const SongItem = (props) => {
  const { audioPlayer, setAudioPlayer } = useContext(AudioPlayer);
  const handlePress = () => {
    //setAudioPlayer(prevState => ({...prevState, currentTrack:props?.item}))
    props.onPress(props.item.songID, props.ind);
  };
  return (
    <Pressable onPress={handlePress}
      style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
      <Image style={{ width: 50, height: 50, marginRight: 10 }} source={{ uri: props?.item?.performerImage }} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={props?.isPlaying ? {
          fontWeight: 'bold', fontSize: 14, color: "#3FFF00"
        } : { fontWeight: 'bold', fontSize: 14, color: 'white' }}>{props?.item?.songName}</Text>
        <Text style={{ marginTop: 4, color: '#989898' }}>{props?.item?.performerName} • {props?.item?.genreName}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginHorizontal: 10 }}>
        <Text style={{color:'white'}}>{props?.item?.length}</Text>
        <Pressable>
          <AntDesign name="heart" size={24} color="#1DB954" onPress={() => props.deleteFromFavorites(props.item.songID)} />
        </Pressable>
      </View>
    </Pressable>
  )
}

export default SongItem

const styles = StyleSheet.create({})