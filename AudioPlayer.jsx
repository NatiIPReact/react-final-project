import { createContext, useEffect, useState, useRef } from "react";
import { apiStart } from './api'
import { Audio } from "expo-av"
import { useGlobalState } from "./components/user";
import { useRecentlyPlayedContext } from "./RecentlyPlayed";
const AudioPlayer = createContext();
const AudioPlayerContext = ({ children }) => {
    const { user, setUser } = useGlobalState();
    const { recentlyPlayed, setRecentlyPlayed } = useRecentlyPlayedContext();
    const [timeSinceLastUpdate, setTimeSinceLastUpdate] = useState(0);
    const playFirstInQueue = async () => {
        await updateQueueAndPlay(audioPlayer.songQueue[0].songID);
    };
    const updateQueueAndPlay = async (songID,/*updateID = false,*/ songQueue = null, curr = 0, positionToPlay = -1) => {
        /*
        if (updateID === true) {
            for (i in audioPlayer.songQueue) {
                if (audioPlayer.songQueue[i].songID === songID) {
                    audioPlayer.currentInQueue=parseInt(i);
                    break;
                }
            }
        } */
        const api = `${apiStart}/Songs/GetSongMSDuration/SongID/${songID}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => res.json())
            .then((response) => {
                if (songQueue == null) {
                    setAudioPlayer(prevState => ({
                        ...prevState, totalDuration: response.songDuration
                        , currentTrack: audioPlayer.songQueue[audioPlayer.currentInQueue],
                        positionToPlay:positionToPlay
                    }))
                    return;
                }
                setAudioPlayer(prevState => ({
                    ...prevState, totalDuration: response.songDuration,
                    currentInQueue: audioPlayer.currentInQueue,
                    songQueue: songQueue,
                    currentInQueue: curr,
                    currentTrack: songQueue[curr],
                    positionToPlay:positionToPlay
                }))
            })
            .catch((e) => {
                if (songQueue == null) {
                    setAudioPlayer(prevState => ({ ...prevState, totalDuration: 240000, currentInQueue: audioPlayer.currentInQueue, positionToPlay:positionToPlay }))
                    return;
                }
                setAudioPlayer(prevState => ({
                    ...prevState, totalDuration: 240000,
                    currentInQueue: audioPlayer.currentInQueue,
                    songQueue: songQueue,
                    currentInQueue: curr,
                    positionToPlay:positionToPlay
                }))
            })
    };
    const playRadioStation = (index) => {
        let RadioStations = [{
            'uri': 'https://stream.radiojar.com/gngfpx33hwzuv',
            "genreName": 'Kids Radio Live',
            'performerImage': 'https://i.imgur.com/IdLpgkF_d.webp?maxwidth=760&fidelity=grand',
            'performerName': 'LIVE STATION',
            'songLength': 0,
            'songName': 'Kids Radio Live',
            isRadioStation: true
        }, {
            'uri': 'https://streams.90s90s.de/dab-national/mp3-192/',
            "genreName": 'German Pop Radio Live',
            'performerImage': 'https://freerangestock.com/sample/64357/pop-music-means-sound-track-and-melodies.jpg',
            'performerName': 'LIVE STATION',
            'songLength': 0,
            'songName': 'German Pop Radio Live',
            isRadioStation: true
        }, {
            'uri': 'https://streams.90s90s.de/danceradio/mp3-192/',
            "genreName": 'German Dance Radio Live',
            'performerImage': 'https://static.mytuner.mobi/media/tvos_radios/q8ne5lhjxbcf.jpg',
            'performerName': 'LIVE STATION',
            'songLength': 0,
            'songName': 'German Dance Radio Live',
            isRadioStation: true
        }, {
            'uri': 'https://streams.90s90s.de/danceradio/mp3-192/',
            "genreName": 'Dance Radio Live',
            'performerImage': 'https://static.mytuner.mobi/media/tvos_radios/mmvGSBqcQB.png',
            'performerName': 'LIVE STATION',
            'songLength': 0,
            'songName': 'Dance Radio Live',
            isRadioStation: true
        }, {
            'uri': 'https://stream.radiojar.com/gngfpx33hwzuv',
            "genreName": 'German Kids Radio Live',
            'performerImage': 'https://www.radio.net/images/broadcasts/81/9d/104930/2/c300.png',
            'performerName': 'LIVE STATION',
            'songLength': 0,
            'songName': 'German Kids Radio Live',
            isRadioStation: true
        }, {
            'uri': 'https://streams.90s90s.de/dab-national/mp3-192/',
            "genreName": 'Pop Radio Live',
            'performerImage': 'https://freerangestock.com/sample/64357/pop-music-means-sound-track-and-melodies.jpg',
            'performerName': 'LIVE STATION',
            'songLength': 0,
            'songName': 'Pop Radio Live',
            isRadioStation: true
        }];
        setAudioPlayer(prevState => ({
            ...prevState, totalDuration: audioPlayer.totalDuration === 0 ? 1 : 0,
            currentInQueue: 0,
            songQueue: [RadioStations[index]],
            currentTrack: RadioStations[index]
        }))
    }
    const changePosition = async (newPositionZeroToOne) => {
        if (audioPlayer?.currentTrack?.isRadioStation === true) {
            return;
        }
        if (audioPlayer && audioPlayer.currentSound) {
            const newPosition = parseInt(audioPlayer.totalDuration * newPositionZeroToOne);
            try {
                await audioPlayer.currentSound.setPositionAsync(newPosition, { toleranceMillisBefore: 2000, toleranceMillisAfter: 2000 })
            }
            catch (e) {
                console.log(e)
            }
        }
    };
    const play = async (nextTrack) => {
        const songURL = `${apiStart}/Songs/GetSongByID/SongID/${nextTrack.songID}`;
        try {
            if (audioPlayer.currentSound) {
                await audioPlayer.currentSound.pauseAsync();
            }
            await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false, shouldDuckAndroid: false });
            const { sound, status } = await Audio.Sound.createAsync({ uri: songURL }, { shouldPlay: true, isLooping: false }, onPlaybackStatusUpdate);
            const api = `${apiStart}/Users/GetLastPositionInSong/UserID/${user?.id}/SongID/${nextTrack.songID}`;
            onPlaybackStatusUpdate(status);
            setAudioPlayer(prevState => ({ ...prevState, isPlaying: status.isLoaded, currentSound: sound }))
            if (audioPlayer?.positionToPlay == undefined || audioPlayer?.positionToPlay == null || audioPlayer?.positionToPlay === -1) {
                fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
                .then(res => res.json()).then(async res => {
                    if (res != undefined && res.position != undefined) {
                        await sound.playFromPositionAsync(res.position, { toleranceMillisBefore: 2000, toleranceMillisAfter: 2000 });
                    }
                    else await sound.playAsync();
                }).catch(async res => {
                    await sound.playAsync();
                });
            } else {
                await sound.playFromPositionAsync(audioPlayer?.positionToPlay, { toleranceMillisBefore: 2000, toleranceMillisAfter: 2000 });
            }
            const recentlyPlayedURL = `${apiStart}/Users/PostUserRecentlyPlayed/UserID/${user?.id}/SongID/${nextTrack?.songID}`;
            fetch(recentlyPlayedURL, { method: "POST", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            let isInRecentlyPlayed = false;
            for (i of recentlyPlayed) {
                if (i?.songID === nextTrack?.songID) {
                    isInRecentlyPlayed = true;
                    break;
                }
            }
            if (!isInRecentlyPlayed) {
                setRecentlyPlayed([...recentlyPlayed, nextTrack])
            }
        } catch (err) {
            console.log(err);
        }
    };
    const updateTrackIsInFav = () => {
        if (audioPlayer != undefined && audioPlayer.currentTrack != null) {
            let updated = { ...audioPlayer.currentTrack, isInFav: audioPlayer.currentTrack.isInFav === 0 ? 1 : 0 };
            setAudioPlayer(prevState => ({ ...prevState, currentTrack: updated }))
        }
    };
    const onPlaybackStatusUpdate = async (status) => {
        if (status.isLoaded && status.isPlaying) {
            const progress = audioPlayer.totalDuration === null ? 0 : status.positionMillis / audioPlayer.totalDuration;
            setAudioPlayer(prevState => ({ ...prevState, progress: progress, currentTime: status.positionMillis }))
        }
        if (status.didJustFinish === true) {
            const api = `${apiStart}/Users/UpdateUserPositionInSong/UserID/${user?.id}/SongID/${audioPlayer?.currentTrack?.songID}/Position/${0}`;
            fetch(api, { method: "PUT", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            setAudioPlayer(prevState => ({ ...prevState, currentSound: null, isPlaying: false }))
            playNextTrack();
        }
    };
    const handlePlayPause = async () => {
        if (audioPlayer.currentSound) {
            if (audioPlayer.isPlaying) {
                await audioPlayer.currentSound.pauseAsync();
            } else {
                await audioPlayer.currentSound.playAsync();
            }
            setAudioPlayer(prevState => ({ ...prevState, isPlaying: !audioPlayer.isPlaying }))
        }
    };
    const pauseSong = async () => {
        if (audioPlayer.currentSound && audioPlayer.isPlaying) {
            await audioPlayer.currentSound.pauseAsync();
            setAudioPlayer(prevState => ({ ...prevState, isPlaying: false }))
        }
    };
    function shuffleQueue(queue = null) {
        var array = JSON.parse(JSON.stringify(queue == null ? audioPlayer.songQueue : queue));
        let currentIndex = array.length;
        while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        updateQueueAndPlay(array[0].songID, array, 0);
    }
    const playNextTrack = async () => {
        if (audioPlayer?.currentTrack?.isRadioStation === true) {
            return;
        }
        let tmp = audioPlayer.currentInQueue;
        tmp++;
        if (tmp >= audioPlayer.songQueue.length) {
            tmp = 0;
        }
        if (audioPlayer.currentSound && audioPlayer?.currentTrack?.songID !== audioPlayer.songQueue[tmp].songID) {
            await audioPlayer.currentSound.pauseAsync();
            setAudioPlayer(prevState => ({ ...prevState, currentSound: null }))
        }
        if (tmp < audioPlayer.songQueue.length && tmp >= 0) {
            //setAudioPlayer(prevState => ({...prevState,currentTrack:audioPlayer.songQueue[tmp],currentInQueue:tmp}))
            await updateQueueAndPlay(audioPlayer.songQueue[tmp].songID, audioPlayer.songQueue, tmp);
        }
    }
    const isFirstRender = useRef(true);
    const [audioPlayer, setAudioPlayer] = useState({
        songQueue: null,
        currentInQueue: 0,
        currentTrack: null,
        currentSound: null,
        progress: null,
        currentTime: 0,
        isPlaying: false,
        totalDuration: null
    });
    const streamRadio = async () => {
        if (audioPlayer.currentSound) {
            await audioPlayer.currentSound.pauseAsync();
        }
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false, shouldDuckAndroid: false });
        const { sound, status } = await Audio.Sound.createAsync({ uri: audioPlayer?.currentTrack?.uri }, { shouldPlay: true, isLooping: false }, onPlaybackStatusUpdate);
        onPlaybackStatusUpdate(status);
        setAudioPlayer(prevState => ({ ...prevState, isPlaying: status.isLoaded, currentSound: sound }))
        await sound.playAsync();
    }
    useEffect(() => {
        if (isFirstRender.current === true) {
            isFirstRender.current = false;
            return;
        }
        if (audioPlayer.totalDuration !== null && audioPlayer?.currentTrack?.isRadioStation === true) {
            streamRadio();
            return;
        }
        if (audioPlayer.totalDuration !== null) {
            play(audioPlayer.songQueue[audioPlayer.currentInQueue]);
        }
    }, [audioPlayer.totalDuration]);
    useEffect(() => {
        if ((!(audioPlayer?.currentTrack?.isRadioStation === true)) && timeSinceLastUpdate <= 10000)
            setTimeSinceLastUpdate(prevState => prevState + 500);
    }, [audioPlayer.currentTime])
    useEffect(() => {
        if (timeSinceLastUpdate > 10000) {
            const api = `${apiStart}/Users/UpdateUserPositionInSong/UserID/${user?.id}/SongID/${audioPlayer?.currentTrack?.songID}/Position/${parseInt(audioPlayer?.currentTime)}`;
            fetch(api, { method: "PUT", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            setTimeSinceLastUpdate(0);
        }
    }, [timeSinceLastUpdate])
    const playPreviousTrack = async () => {
        if (audioPlayer?.currentTrack?.isRadioStation === true) {
            return;
        }
        let tmp = audioPlayer.currentInQueue - 1;
        if (tmp < 0) {
            tmp = audioPlayer.songQueue.length - 1;
        }
        if (audioPlayer.currentSound && audioPlayer?.currentTrack?.songID !== audioPlayer.songQueue[tmp].songID) {
            await audioPlayer.currentSound.pauseAsync();
            setAudioPlayer(prevState => ({ ...prevState, currentSound: null }))
        }
        if (tmp < audioPlayer.songQueue.length && tmp >= 0) {
            //setAudioPlayer(prevState => ({...prevState,currentInQueue:tmp,currentTrack:audioPlayer.songQueue[tmp]}))
            await updateQueueAndPlay(audioPlayer.songQueue[tmp].songID, audioPlayer.songQueue, tmp);
        }
    }
    return (<AudioPlayer.Provider value={{ audioPlayer, pauseSong, changePosition, updateTrackIsInFav, playRadioStation, setAudioPlayer, playPreviousTrack, playNextTrack, handlePlayPause, updateQueueAndPlay, shuffleQueue }}>{children}</AudioPlayer.Provider>)
}
export { AudioPlayerContext, AudioPlayer }