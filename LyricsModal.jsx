import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { apiStart } from './api';
import { MaterialIcons, Entypo } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

const LyricsOverlay = ({ song, hideLyricsModal, pauseSong }) => {
  const [lyrics, setLyrics] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  useEffect(() => {
    const api = `${apiStart}/Songs/GetSongLyrics/SongID/${song.songID}`;
    fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
      .then(res => res.json())
      .then(res => {
        setLyrics(res.Lyrics);
      }).catch(e => console.log(e));
  }, []);
  const speakLyrics = async () => {
    await pauseSong();
    Speech.speak(song?.songName + 'by' + song?.performerName + '.\n' + lyrics);
    setIsSpeaking(true);
  };
  const stopSpeech = async () => {
    await Speech.stop();
    setIsSpeaking(false);
  };
  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          hideLyricsModal();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row' }}>
              <Pressable style={{position:'absolute',right:140,top:5}} onPress={isSpeaking ? stopSpeech : speakLyrics}>
                {isSpeaking ? <Entypo name='controller-stop' size={24} color='black' /> :
                <MaterialIcons name="barcode-reader" size={24} color='black' />}
              </Pressable>
              <Text style={styles.songTitle}>{song.songName}</Text>
            </View>
            <ScrollView>
              <Text style={styles.lyricsText}>
                {lyrics}
              </Text>
            </ScrollView>
            <Pressable
              style={styles.closeButton}
                onPress={() => {hideLyricsModal(); if (isSpeaking) stopSpeech(); }}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
    justifyContent: 'center',
    alignItems: 'center', // Center horizontally and vertically
    alignSelf: 'center', // Adjust self-alignment
  },
  songTitle: {
    fontSize: 30,
    marginBottom: 20,
    textAlign: 'center'
  },
  lyricsText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center' // Center the text within ScrollView
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 50,
    fontWeight: 'bold',
  },
});

export default LyricsOverlay;
