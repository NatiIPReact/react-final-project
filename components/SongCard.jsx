import { StyleSheet, Text, View, Image, Pressable } from 'react-native'
import React, { useContext } from 'react'
import { AudioPlayer } from '../AudioPlayer';

const SongCard = (props) => {
  const { audioPlayer, setAudioPlayer, updateQueueAndPlay, shuffleQueue } = useContext(AudioPlayer);
  const playSong = () => {
    updateQueueAndPlay(props?.item?.songID, [props.item], 0);
  };
  return (
    <Pressable style={{margin:10}} onPress={()=>playSong()}>
      <Image source={{uri:props.item.performerImage}} style={{width:130,height:130,borderRadius:5}}/>
      <Text style={{fontSize:13,fontWeight:'500',color:'white',marginTop:10}}>{props.item.songName.length > 21 ? props.item.songName.slice(0,18) + '...' : props.item.songName}</Text>
    </Pressable>
  )
}

export default SongCard

const styles = StyleSheet.create({})