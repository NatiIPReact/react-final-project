import { Pressable, StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';

const TopArtistCard = (props) => {
  const navigation = useNavigation();
  return (
    <Pressable style={{margin:10}} onPress={() => navigation.navigate('Artist', {
      item:props.item
    })}>
        <Image style={{width:130,height:130,borderRadius:5}} source={{uri: props.item.performerImage}}/>
        <Text numberOfLines={1} style={{fontSize:13,fontWeight:'500',color:'white',marginTop:10}}>{props.item.performerName}</Text>
    </Pressable>
  )
}

export default TopArtistCard

const styles = StyleSheet.create({})