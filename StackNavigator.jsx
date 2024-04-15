import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import {Entypo,AntDesign,Ionicons,Feather,FontAwesome} from '@expo/vector-icons';
import ProfileScreen from "./screens/ProfileScreen";
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import EmailLogin from "./screens/EmailLogin";
import LikedSongsScreen from "./screens/LikedSongsScreen";
import MyLibrary from "./screens/MyLibrary";
import Playlist from "./screens/Playlist";
import Artist from "./screens/Artist";
import Search from "./screens/Search";
import Signup from "./screens/Signup";
import Quizzes from "./screens/Quizzes";
import HistoricQuiz from "./screens/HistoricQuiz";
import PlayQuiz from "./screens/PlayQuiz";

const Tab = createBottomTabNavigator();

function BottomTabs() {
    return (
        <Tab.Navigator screenOptions={{
            tabBarStyle:{
                backgroundColor:"rgba(0,0,0,0.5)",
                position: "absolute",
                bottom:0,
                left:0,
                right:0,
                shadowOpacity:4,
                shadowRadius:4,
                elevation:4,
                shadowOffset:{
                    width:0,
                    height:-4
                },
                borderTopWidth:0 
            }
        }}>
            <Tab.Screen name="Home" component={HomeScreen} options={{tabBarLabel:"Home",headerShown:false,
            tabBarLabelStyle:{color:'white'},tabBarIcon:({focused}) => focused ? (<Entypo name="home" size={24} color="white"/>)
            : (<AntDesign name="home" size={24} color="white"/>)}}/>

            <Tab.Screen name="Search" component={Search} options={{tabBarLabel:"Search",headerShown:false,
            tabBarLabelStyle:{color:'white'},tabBarIcon:({focused}) => focused ? (<FontAwesome name="search" size={24} color="white"/>)
            : (<Feather name="search" size={24} color="white"/>)}}/>

            <Tab.Screen name="MyLibrary" component={MyLibrary} options={{tabBarLabel:"My Library",headerShown:false,
            tabBarLabelStyle:{color:'white'},tabBarIcon:({focused}) => focused ? (<Ionicons name="library" size={24} color="white"/>)
            : (<Ionicons name="library-outline" size={24} color="white"/>)}}/>

            <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarLabel:"Home",headerShown:false,
            tabBarLabelStyle:{color:'white'},tabBarIcon:({focused}) => focused ? (<Ionicons name="person" size={24} color="white"/>)
            : (<Ionicons name="person-outline" size={24} color="white"/>)}}/>
        </Tab.Navigator>
    )
}

const Stack = createNativeStackNavigator();
function Navigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/>
                <Stack.Screen name="EmailLogin" component={EmailLogin} options={{headerShown:false}}/>
                <Stack.Screen name="Signup" component={Signup} options={{headerShown:false}}/>
                <Stack.Screen name="Main" component={BottomTabs} options={{headerShown:false}}/>
                <Stack.Screen name="Liked" component={LikedSongsScreen} options={{headerShown:false}}/>
                <Stack.Screen name="Playlist" component={Playlist} options={{headerShown:false}}/>
                <Stack.Screen name="Artist" component={Artist} options={{headerShown:false}}/>
                <Stack.Screen name="Quiz" component={Quizzes} options={{headerShown:false}}/>
                <Stack.Screen name="SpecificQuizHistory" component={HistoricQuiz} options={{headerShown:false}}/>
                <Stack.Screen name="PlayQuiz" component={PlayQuiz} options={{headerShown:false}}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default Navigation;