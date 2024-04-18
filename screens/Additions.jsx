import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Entypo, MaterialCommunityIcons, AntDesign, Ionicons } from "@expo/vector-icons";

const Additions = () => {
  const navigation = useNavigation();
  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { zIndex: 10 }]}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.loginText}>My Additions</Text>
      </View>
      <ScrollView>
        <View>
          <Text style={styles.titleText}>Audible Songs</Text>
          <Text style={styles.paragraphText}>I've made a python app that downloads songs of certain artist to your local PC,
I converted the file of the song to hexa and added manually to our SQL db.
Using this data, I can play the mp3 songs in my app pages on demand. You can see the python app here:
https://github.com/NatiYP/pyApp</Text>
<Image source={{uri:'https://i.imgur.com/t3e8Da5_d.webp?maxwidth=760&fidelity=grand'}} style={styles.image}/>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

export default Additions

const styles = StyleSheet.create({header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginBottom: 20,
  justifyContent: 'center', // Center items horizontally
  marginTop: 50
},
backButton: {
  position: 'absolute', // Position the back button absolutely
  left: 20, // Adjust this value as needed
},
loginText: {
  color: 'white',
  fontSize: 25,
  fontWeight: 'bold',
  flex: 1, // Take up remaining space
  textAlign: 'center',
},
titleText:{
  color:'white',
  fontWeight:'bold',
  fontSize:22,
  textAlign:'center'
},
paragraphText:{
  color:'white',
  fontWeight:'500',
  fontSize:20,
  textAlign:'center',
  margin:10,
  marginBottom:20
},
image: {
  width:'100%',
  height:60,
}
})