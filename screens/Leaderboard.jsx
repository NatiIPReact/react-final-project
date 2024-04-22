import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Pressable, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { apiStart } from '../api'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, Entypo, AntDesign, Fontisto } from '@expo/vector-icons';
import ProfilePicture from '../ProfilePicture'
import { useGlobalState } from '../components/user'

const Leaderboard = () => {
    const [data, setData] = useState([]);
    const [playerDataModalVisible, setPlayerDataModalVisible] = useState({ visible: false, playerData: null });
    const navigation = useNavigation();
    const [sortingModalVisible, setSortingModalVisible] = useState(false);
    const [sortedBy, setSortedBy] = useState('XP');
    const { user, setUser } = useGlobalState();
    useEffect(() => {
        const api = `${apiStart}/Users/GetLeaderboard`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => res.json())
            .then(res => {
                setData(res)
            }).catch(e => console.log(e))
    }, [])
    const showPlayerDataModal = (playerIndex) => {
        setPlayerDataModalVisible({ visible: true, playerData: data[playerIndex] })
    };
    const sort = (sortBy) => {
        setSortingModalVisible(false);
        let tmp = [...data];
        let sorted = [];
        switch (sortBy) {
            case "XP":
                sorted = tmp.slice().sort((a, b) => b.xp - a.xp);
                break;
            case "AVG":
                sorted = tmp.slice().sort((a, b) => b.soloAverage.toFixed(2) - a.soloAverage.toFixed(2));
                break;
            case "GP":
                sorted = tmp.slice().sort((a, b) => b.gamesPlayed - a.gamesPlayed);
                break;
            case "CA":
                sorted = tmp.sort((a, b) => {
                    if (a.soloQuestionsGotRight === b.soloQuestionsGotRight) {
                        return 0;
                    } else if (a.soloQuestionsGotRight > b.soloQuestionsGotRight) {
                        return -1;
                    } else {
                        return 1;
                    }
                });
                break;
            default:
                sorted = tmp;
                break;
        }
        setData([...sorted]);
        setSortedBy(sortBy);
    };


    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.quizText}>{sortedBy} Leaderboard</Text>
            </View>
            <Pressable onPress={() => setSortingModalVisible(true)} style={{ marginBottom:8, marginHorizontal: 10, backgroundColor: 'gray', padding: 10, borderRadius: 7, height: 38 }}>
                <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Sort</Text>
            </Pressable>
            <ScrollView>
                {data?.map((player, index) => (
                    <Pressable key={index} onPress={() => showPlayerDataModal(index)}>
                        <View style={{ margin: 5, marginLeft: 15 }}>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                    {player.image == null ? <ProfilePicture name={player?.userName} /> :
                                        <Image source={{ uri: `data:image/jpeg;base64,${player.image}` }} style={{ width: 65, height: 65, borderRadius: 50 }} />
                                    }
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={{ color: user?.id === player.userID ? "#1DB954" : 'white' }}>{player?.userName}{user?.id === player.userID ? " (me)" : ""}</Text>
                                        <Text style={{ color: 'gray' }}>Level {player?.level}</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="white" />
                            </View>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
            {playerDataModalVisible.visible === true && (
                <View style={{ flex: 1 }}>
                    <Modal
                        visible={playerDataModalVisible.visible}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={() => { setPlayerDataModalVisible({ ...playerDataModalVisible, visible: false }); }} >
                        <Pressable
                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                            onPress={() => { setPlayerDataModalVisible({ ...playerDataModalVisible, visible: false }); }}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text style={{ textAlign: 'center', color: '#3bc8e7', fontSize: 25, fontWeight: 'bold', marginBottom: 5 }}>{playerDataModalVisible.playerData.userName}'s Data</Text>
                                    <Text style={{ color: 'black', fontSize: 17, margin: 1 }}>Level {playerDataModalVisible.playerData.level} With {playerDataModalVisible.playerData.xp} XP</Text>
                                    <Text style={{ color: 'black', fontSize: 17, margin: 1 }}>{playerDataModalVisible.playerData.gamesPlayed} Game{playerDataModalVisible.playerData.gamesPlayed === 1 ? "" : "s"} Played</Text>
                                    <Text style={{ color: 'black', fontSize: 17, margin: 1 }}>{playerDataModalVisible.playerData.soloAverage.toFixed(2)}% Average Score</Text>
                                    <Text style={{ color: 'black', fontSize: 17, margin: 1 }}>{playerDataModalVisible.playerData.soloQuestionsGotRight} Correct Answers</Text>
                                    <Text style={{ color: 'black', fontSize: 17, margin: 1 }}>{playerDataModalVisible.playerData.xp} Total XP</Text>
                                </View>
                            </View>
                        </Pressable>
                    </Modal>
                </View>
            )}
            {sortingModalVisible === true &&
                <View style={styles.backdrop}>
                    <Pressable
                        style={styles.backdrop}
                        onPress={() => setSortingModalVisible(false)}
                    >
                        <View style={styles.bottomSheet}>
                            <Text style={{ fontSize: 25, fontWeight: 'bold', textAlign: 'center', color: 'white', marginBottom: 10 }}>Sort By</Text>
                            <Pressable style={{ flex: 1, flexDirection: 'row' }} onPress={() => sort("XP")}>
                                <Fontisto name={sortedBy === "XP" ? 'radio-btn-active' : 'radio-btn-passive'} size={24} color='white' />
                                <Text style={{ color: 'white', fontSize: 20, marginLeft: 10, fontWeight: '500' }}>Sort By XP</Text>
                            </Pressable>
                            <Pressable style={{ flex: 1, flexDirection: 'row' }} onPress={() => sort("AVG")}>
                                <Fontisto name={sortedBy === "AVG" ? 'radio-btn-active' : 'radio-btn-passive'} size={24} color='white' />
                                <Text style={{ color: 'white', fontSize: 20, marginLeft: 10, fontWeight: '500' }}>Sort By Average</Text>
                            </Pressable>
                            <Pressable style={{ flex: 1, flexDirection: 'row' }} onPress={() => sort("GP")}>
                                <Fontisto name={sortedBy === "GP" ? 'radio-btn-active' : 'radio-btn-passive'} size={24} color='white' />
                                <Text style={{ color: 'white', fontSize: 20, marginLeft: 10, fontWeight: '500' }}>Sort By Games Played</Text>
                            </Pressable>
                            <Pressable style={{ flex: 1, flexDirection: 'row' }} onPress={() => sort("CA")}>
                                <Fontisto name={sortedBy === "CA" ? 'radio-btn-active' : 'radio-btn-passive'} size={24} color='white' />
                                <Text style={{ color: 'white', fontSize: 20, marginLeft: 10, fontWeight: '500' }}>Sort By Correct Answers</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </View>
            }
        </LinearGradient>
    )
}

export default Leaderboard

const styles = StyleSheet.create({
    header: {
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
        zIndex: 10
    },
    quizText: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
        flex: 1, // Take up remaining space
        textAlign: 'center',
    },
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
    },
    backdrop: {
        position: 'absolute',
        flex: 1,
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: "100%",
        height: '100%',
        justifyContent: 'flex-end'
    },
    bottomSheet: {
        width: '100%',
        height: '40%',
        backgroundColor: '#131624',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 20
    }
})