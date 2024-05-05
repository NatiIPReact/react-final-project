import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, Pressable, Linking } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import hmacSHA1 from 'crypto-js/hmac-sha1';
import Base64 from 'crypto-js/enc-base64';
import { AudioPlayer } from '../AudioPlayer';
import { ShazamAccessKey, ShazamSecret } from '../apikeys';
// This is the Shazam page.
const defaultOptions = {
    host: 'identify-ap-southeast-1.acrcloud.com',
    endpoint: '/v1/identify',
    signature_version: '1',
    data_type: 'audio',
    secure: true,
    access_key: ShazamAccessKey,
    access_secret: ShazamSecret,
};

const Shazam = () => {
    const navigation = useNavigation();
    const [listening, setListening] = useState(false);
    const [recording, setRecording] = useState();
    const [message, setMessage] = useState('');
    const [permissionResponse, requestPermission] = Audio.usePermissions();
    const [shazamRes, setShazamRes] = useState(null);
    const { audioPlayer, setAudioPlayer, handlePlayPause } = useContext(AudioPlayer);
    useEffect(() => {
        if (shazamRes === null) return;
        if (shazamRes?.metadata?.music) {
            setMessage(`Found song ${shazamRes?.metadata?.music[0]?.title} by ${shazamRes?.metadata?.music[0]?.external_metadata?.spotify?.artists[0]?.name}`)
        } else {
            setMessage("Sorry... We couldn't find your Song.\rPress to try again.")
        }
    }, [shazamRes]);
    async function startRecording() {
        try {
            if (permissionResponse.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }
            setListening(true);
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }
    async function stopRecording() {
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync(
            {
                allowsRecordingIOS: false,
            }
        );
        const uri = recording.getURI();
        identify(uri, defaultOptions);
    }
    const shazamAudio = () => {
        if (listening) return;
        setMessage('')
        startRecording()
    };
    const stopShazam = () => {
        if (!listening) return;
        setListening(false);
        stopRecording()
    }
    function buildStringToSign(
        method,
        uri,
        accessKey,
        dataType,
        signatureVersion,
        timestamp,
    ) {
        return [method, uri, accessKey, dataType, signatureVersion, timestamp].join(
            '\n',
        );
    }
    function signString(stringToSign, accessSecret) {
        return Base64.stringify(hmacSHA1(stringToSign, accessSecret));
    }
    const findOnYT = async () => {
        const song = shazamRes?.metadata?.music[0]?.title;
        const artist = shazamRes?.metadata?.music[0]?.external_metadata?.spotify?.artists[0]?.name;
        const apiKey = 'AIzaSyAUBDnPCnsMDLrpjpfT9RNnIi25AQD65B8';
        const formattedSongName = encodeURIComponent(song);
        const formattedArtistName = encodeURIComponent(artist);
        const songNameSearch = song.replace(/\s/g, '+');
        const artistNaeSearch = artist.replace(/\s/g, '+');
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${formattedSongName} ${formattedArtistName}&key=${apiKey}`;
        const YTSearchUrl = `https://www.youtube.com/results?search_query=${songNameSearch} ${artistNaeSearch}`;
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            // Retrieve the video ID of the first search result
            const videoId = data.items[0].id.videoId;
            // Construct the YouTube video URL
            const YTLink = `https://www.youtube.com/watch?v=${videoId}`;
            if (audioPlayer?.isPlaying === true) {
                await handlePlayPause();
            }
            Linking.openURL(YTLink);
        } catch (error) {
            console.log(error);
            return YTSearchUrl;
        }
    };
    async function identify(uri, options) {
        var current_data = new Date();
        var timestamp = current_data.getTime() / 1000;
        var stringToSign = buildStringToSign(
            'POST',
            options.endpoint,
            options.access_key,
            options.data_type,
            options.signature_version,
            timestamp,
        );
        let fileinfo = await FileSystem.getInfoAsync(uri, { size: true });
        var signature = signString(stringToSign, options.access_secret);
        var formData = {
            sample: { uri: uri, name: 'sample.wav', type: 'audio/wav' },
            access_key: options.access_key,
            data_type: options.data_type,
            signature_version: options.signature_version,
            signature: signature,
            sample_bytes: fileinfo.size,
            timestamp: timestamp,
        };
        var form = new FormData();
        for (let key in formData) {
            form.append(key, formData[key]);
        }

        let postOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: form,
        };
        let response = await fetch(
            'http://' + options.host + options.endpoint,
            postOptions,
        );
        let result = await response.text();
        setShazamRes(JSON.parse(result));
    }
    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { zIndex: 10 }]}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>Shazam</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Pressable onPress={listening ? stopShazam : shazamAudio}>
                        <Image style={{ width: 200, height: 200 }}
                            source={{ uri: 'https://cdn.icon-icons.com/icons2/1826/PNG/512/4202070logoshazamsocialsocialmedia-115618_115683.png' }} />
                    </Pressable>
                    {listening && <Text style={{color:'white',fontSize:25,fontWeight:'bold',textAlign:'center'}}>Listening... Press to stop.</Text>}
                    {message !== '' && <Text style={{color:'white',fontSize:20,fontWeight:'bold',textAlign:'center',marginTop:20}}>{message}</Text>}
                    {message.includes('Found') && <Pressable onPress={findOnYT}><View style={{flexDirection:'row'}}><Text style={{fontSize:22,color:'white',marginTop:10,fontWeight:'bold'}}>Listen On <Text style={{color:'red',padding:20}}>Youtube</Text>
                    </Text><Entypo style={{marginLeft:10}} name='youtube' size={44} color='red' /></View></Pressable>}
                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}

export default Shazam

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        justifyContent: 'center', // Center items horizontally
    },
    backButton: {
        position: 'absolute', // Position the back button absolutely
        left: 20, // Adjust this value as needed
    },
    loginText: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
        flex: 1, // Take up remaining space
        textAlign: 'center',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    inputContainer: {
        alignItems: 'center',
        width: '80%',
        marginTop: "-40%"
    },
    input: {
        height: 50,
        backgroundColor: '#CBCBCB',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
        width: '100%',
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#6247aa',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});