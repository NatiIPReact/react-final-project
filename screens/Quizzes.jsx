import { Button, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { apiStart } from '../api';
import { useGlobalState } from '../components/user';
import SongModal from '../SongModal';
import { useXPContext } from '../xp';

const Quizzes = () => {
    const quizImages = ['https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg',
        'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        'https://images.pexels.com/photos/1111597/pexels-photo-1111597.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'];
    const navigation = useNavigation();
    const { user, setUser } = useGlobalState();
    const [quizzesList, setQuizzesList] = useState([]);
    const { xp, setXP } = useXPContext();
    const getQuizzes = () => {
        const api = `${apiStart}/Quizs/GetUserPastQuizzesWithoutQuestions/UserID/${user.id}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then((res) => res.json())
            .then((res) => {
                setQuizzesList(res);
            })
            .catch((e) => console.log(e))
    };
    useEffect(() => {
        getQuizzes();
    }, [])
    const playQuiz = () => {
        navigation.navigate('PlayQuiz')
    };
    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { zIndex: 10 }]}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.loginText}>Quizzes</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20, justifyContent: 'center', }}>
                    <TouchableOpacity style={styles.playButton} onPress={playQuiz}>
                        <Text style={styles.buttonText}>Play Quiz</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{color:'white',textAlign:'center',fontSize:20}}>Level {Math.floor(xp / 100) + 1}</Text>
                <Text style={{color:'white',textAlign:'center',fontSize:20}}>You need <Text style={{color:'red'}}>{100 - (xp % 100)} XP</Text> to reach level {Math.floor(xp / 100) + 2}</Text>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Quiz History</Text>
            <ScrollView>
                <View style={{ padding: 15 }}>
                    {quizzesList.length === 0 && <Text style={{color:'white',fontSize:20,fontWeight:'500',textAlign:'center'}}>No Quizzes Played...</Text>}
                    {quizzesList.map((quiz, index) => {
                        return (
                            <Pressable onPress={() => {navigation.navigate('SpecificQuizHistory', {
                                item:quiz
                            })}} key={quiz?.quizID} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 10 }}>
                                <Image style={{ width: 50, height: 50, borderRadius: 4 }} source={{ uri: quizImages[Math.floor(Math.random() * quizImages.length)] }} />
                                <View>
                                    <Text style={{ color: 'white' }}>Grade: {quiz?.quizGrade}</Text>
                                    <Text style={{ color: 'white', marginTop: 7 }}>{quiz?.quizDate} • 5 Questions</Text>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
            <SongModal gapValue={25} />
        </LinearGradient>
    )
}

export default Quizzes

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
    },
    loginText: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
        flex: 1, // Take up remaining space
        textAlign: 'center',
    },
    playButton: {
        backgroundColor: '#6247aa',
        borderRadius: 5,
        paddingVertical: 15,
        alignItems: 'center',
        width: '80%',
        textAlign: 'center'
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    }
})