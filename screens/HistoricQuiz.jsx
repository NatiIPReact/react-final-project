import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation, useRoute } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native'
import { Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import { apiStart } from '../api'
import { ScrollView } from 'react-native'
import SongModal from '../SongModal'

const HistoricQuiz = () => {
    const route = useRoute();
    const [quiz, setQuiz] = useState(null);
    const [quizData, setQuizData] = useState(null);
    const navigation = useNavigation();
    useEffect(() => {
        if (route?.params?.item == null) {
            route.goBack();
            return;
        }
        setQuiz(route.params.item);
        const api = `${apiStart}/Quizs/GetQuizQuestions/QuizID/${route.params.item.quizID}`;
        fetch(api, {method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' })})
        .then((res) => res.json())
        .then((res) => {
            setQuizData(res);
        }).catch(e => {
            console.log(e)
            navigation.goBack();
        })
    }, []);
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.quizText}>Quiz Results</Text>
            </View>
            <Text style={{color:'white',textAlign:'center',fontWeight:'bold',fontSize:20,margin:10}}>Quiz Grade: {quiz?.quizGrade}%</Text>
            <Text style={{color:'white',textAlign:'center',fontWeight:'bold',fontSize:20,margin:10}}>Played On: {quiz?.quizDate?.split('T')[0]}</Text>
            <ScrollView style={{textAlign:'center'}}>
                {quizData != null && quizData?.questions?.map((question,index) => {return (
                    <View key={index + 1} style={{textAlign:'center',margin:5}}>
                        <Text style={{color:'white',textAlign:'center',fontWeight:'bold',fontSize:18}}>Question {index + 1}</Text>
                        <Text style={{color:'wheat',textAlign:'center',fontSize:15,fontWeight:'400'}}>{question?.content}</Text>
                        {question?.answers?.map((answer,index) => {
                            return (
                                <Text style={{color:'white',textAlign:'center',fontSize:16,margin:2,backgroundColor:calculateColor(question.userAnswer,index,question.correctAnswer)}}>{String.fromCharCode(index + 97)}) {answer}{calculateEmoji(question.userAnswer,index,question.correctAnswer)}</Text>
                            )
                        })}
                    </View>
                )})}
            </ScrollView>
            <SongModal gapValue={25} />
        </LinearGradient>
    )
}

export default HistoricQuiz

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
    }
})