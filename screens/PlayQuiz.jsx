import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import { useGlobalState } from '../components/user';
import { apiStart } from '../api';
import { ScrollView } from 'react-native';
import SongModal from '../SongModal';

const PlayQuiz = () => {
    const navigation = useNavigation();
    const { user, setUser } = useGlobalState();
    const [answersData, setAnswersData] = useState({ currentQuestion: 0, userAnswers: [] });
    const [timeLeft, setTimeLeft] = useState(180);
    const [quiz, setQuiz] = useState(null);
    const [timerInterval, setTimerInterval] = useState(null);
    useEffect(() => {
        if (user) {
            const api = `${apiStart}/Quizs/StartQuiz/UserID/${user.id}`;
            fetch(api, { method: "POST", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
                .then((res) => res.json())
                .then(res => {
                    setQuiz(res);
                    setTimerInterval(setInterval(() => {
                        setTimeLeft((prevSeconds) => prevSeconds - 1);
                    }, 1000))
                }).catch(e => {
                    console.log(e);
                    navigation.goBack();
                })
        } else {
            navigation.goBack();
        }
    }, []);
    useEffect(() => {
        if (timeLeft <= -1) {
            clearInterval(timerInterval);
            setTimerInterval(null);
            let answers = [...answersData.userAnswers];
            for (let i  = answers.length; i < quiz?.questions?.length; i++) {
                answers.push(-1);
            }
            setAnswersData({
                    currentQuestion: quiz?.questions?.length,
                    userAnswers: answers
        })
        }
    }, [timeLeft])
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const remainingSeconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    const calculateGrade = () => {
        let count = 0;
        for (i in quiz.questions) {
            if (i < answersData.userAnswers.length && quiz.questions[i].correctAnswer === answersData.userAnswers[i])
                count++;
        }
        return Math.floor(count / quiz.questions.length * 100);
    };
    const answeredQuestion = (answer) => {
        const api = `${apiStart}/Questions/UpdateUserAnswer/QuestionID/${quiz.questions[answersData.currentQuestion].id}/Answer/${answer}`;
        fetch(api, { method: "PUT", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => res.json())
            .then(res => {
                if (answersData.currentQuestion === 4) {
                    clearInterval(timerInterval);
                    setTimerInterval(null);
                }
                setAnswersData(prevState => {
                    return {
                        currentQuestion: prevState.currentQuestion + 1,
                        userAnswers: [...prevState.userAnswers, answer]
                    }
                })
            })
            .catch(e => {
                console.log(e);
                setAnswersData(prevState => {
                    return {
                        currentQuestion: prevState.currentQuestion + 1,
                        userAnswers: [...prevState.userAnswers, -1]
                    }
                })
            })
    };
    const calculateColor = (userAnswer, answer, correctAnswer) => {
        if (userAnswer !== correctAnswer && answer === correctAnswer) {
            return 'green';
        }
        return 'transparent';
    };
    const calculateEmoji = (userAnswer, answer, correctAnswer) => {
        if (userAnswer !== correctAnswer && userAnswer === answer) {
            return '❌';
        }
        return userAnswer === answer ? '✅' : '';
    };
    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </Pressable>
                <Text style={styles.quizText}>Quiz Results</Text>
            </View>
            {quiz && answersData.currentQuestion < quiz?.questions?.length &&
                <View style={{ marginTop: 30 }}>
                    <Text style={{ color: 'white', fontSize: 23, textAlign: 'center', margin: 10, fontWeight: 'bold' }}>Question {answersData.currentQuestion + 1}</Text>
                    <Text style={{ color: 'white', fontSize: 23, textAlign: 'center', margin: 7 }}>{formatTime(timeLeft)}</Text>
                    <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', marginTop: 35, fontWeight: '500' }}>{quiz?.questions[answersData.currentQuestion]?.content}</Text>
                    <View>
                        <Pressable style={[styles.optionButton, { marginTop: 50 }]} onPress={() => answeredQuestion(0)}>
                            <Text style={styles.optionText}>{quiz.questions[answersData.currentQuestion].answers[0]}</Text>
                        </Pressable>
                        <Pressable style={styles.optionButton} onPress={() => answeredQuestion(1)}>
                            <Text style={styles.optionText}>{quiz.questions[answersData.currentQuestion].answers[1]}</Text>
                        </Pressable>
                        <Pressable style={styles.optionButton} onPress={() => answeredQuestion(2)}>
                            <Text style={styles.optionText}>{quiz.questions[answersData.currentQuestion].answers[2]}</Text>
                        </Pressable>
                        <Pressable style={styles.optionButton} onPress={() => answeredQuestion(3)}>
                            <Text style={styles.optionText}>{quiz.questions[answersData.currentQuestion].answers[3]}</Text>
                        </Pressable>
                    </View>
                </View>
            }
            {quiz && answersData.currentQuestion >= quiz?.questions?.length && (<ScrollView>
                <Text style={{color:'white',fontSize:23,fontWeight:'bold',textAlign:'center', marginBottom: 9}}>Quiz Grade: {calculateGrade()}%</Text>
                {quiz?.questions?.map((question, index) => (
                    <View key={index + 1} style={{ alignItems: 'center', margin: 5 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>Question {index + 1}</Text>
                        <Text style={{ color: 'wheat', fontSize: 15, fontWeight: '400', textAlign: 'center' }}>{question?.content}</Text>
                        {question?.answers?.map((answer, ind) => (
                            <Text key={ind + 1} style={{ color: 'white', fontSize: 16, margin: 2, backgroundColor: calculateColor(answersData?.userAnswers[index], ind, question?.correctAnswer), textAlign: 'center' }}>
                                {String.fromCharCode(ind + 97)}) {answer}{calculateEmoji(answersData?.userAnswers[index], ind, question?.correctAnswer)}
                            </Text>
                        ))}
                    </View>
                ))}</ScrollView>)
            }
            <SongModal gapValue={25} />
        </LinearGradient>
    )
}

export default PlayQuiz

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
        zIndex:10
    }, quizText: {
        color: 'white',
        fontSize: 25,
        fontWeight: 'bold',
        flex: 1, // Take up remaining space
        textAlign: 'center',
    },
    optionButton: {
        backgroundColor: "#1DB954",
        padding: 10,
        marginLeft: "auto",
        marginRight: "auto",
        width: 300,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        margin: 12
    },
    optionText: {
        fontSize: 16,
    }
})