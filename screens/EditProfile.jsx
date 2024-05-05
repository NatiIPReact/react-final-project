import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { Ionicons, Entypo, AntDesign } from '@expo/vector-icons';
import { useGlobalState } from '../components/user';
import { apiStart } from '../api';
import * as ImagePicker from 'expo-image-picker';
import ProfilePicture from '../ProfilePicture';
import * as FileSystem from 'expo-file-system';
import SongModal from '../SongModal';
// This is the edit profile page.
const EditProfile = () => {
    const navigation = useNavigation();
    const { user, setUser } = useGlobalState();
    const [email, setEmail] = useState(user?.email);
    const [password, setPassword] = useState(user?.password);
    const [name, setName] = useState(user?.name);
    const [errorMessage, setErrorMessage] = useState('');
    const [image, setImage] = useState(null);
    const [phone, setPhone] = useState("");
    const [successMessage, setSuccessMessage] = useState('');
    const save = async () => {
        let imageString;
        let data = {
            id: user?.id,
            email,
            password,
            name
        };
        if (image != null) {
            imageString = await FileSystem.readAsStringAsync(image.assets[0].uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            data.image = imageString;
        } else {
            data.image = ''
        }
        const api = `${apiStart}/Users/UpdateUserDetails?oldEmail=${user?.email}`;
        fetch(api, { method: "PUT", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }), body: JSON.stringify(data) })
            .then((res) => res.json())
            .then(res => {
                if (res?.message !== "Updated") {
                    setErrorMessage(res?.message)
                    return;
                }
                setSuccessMessage(res?.message)
                setUser({ ...user, email: email, password: password, name: name, image: image == null ? user?.image : imageString })
            }).catch(e => console.log(e))
        const phoneAPI = `${apiStart}/Users/UpdateUserPhone/UserID/${user?.id}/Phone/${phone == null ? "-1" : phone?.includes('+') ? phone.replace(/\+/g, '') : phone === "" ? "-1" : phone}`;
        if (phone == null)
            setPhone('');
        fetch(phoneAPI, { method: "PUT", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => {
                return res.json()
            }).then(res => {
                if (res.message != undefined && res.message.includes('taken')) {
                    setErrorMessage(res.message)
                } else setErrorMessage("")
            });
    };
    const getPhoneNumber = () => {
        const api = `${apiStart}/Users/GetUserPhoneNumber/UserID/${user?.id}`;
        fetch(api, { method: "GET", headers: new Headers({ 'Content-Type': 'application/json; charset=UTF-8' }) })
            .then(res => res.json())
            .then(res => {
                if (res == undefined || res.phoneNumber == undefined || res.phoneNumber.includes('null')) {
                    setPhone('');
                    return;
                }
                setPhone(res.phoneNumber);
            }).catch(e => console.log(e))
    };
    useEffect(() => {
        getPhoneNumber()
    }, [])
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!(result?.canceled === true)) {
            setImage(result);
        }
    };
    return (
        <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { setErrorMessage(''); setSuccessMessage(''); navigation.goBack() }} style={[styles.backButton, { zIndex: 10 }]}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.loginText}>Edit Profile</Text>
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.inputContainer}>
                    <Pressable onPress={pickImage} style={{ marginBottom: 25 }}>
                        {image != null ? <Image source={{ uri: image.assets[0].uri }} style={{ width: 65, height: 65, borderRadius: 50 }} /> : (user !== undefined && user.image == null) ? <ProfilePicture name={user?.name} /> : <Image source={{ uri: `data:image/jpeg;base64,${user.image}` }} style={{ width: 65, height: 65, borderRadius: 50 }} />}
                    </Pressable>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor="#003f5c"
                        onChangeText={(newName) => setName(newName)}
                        value={name}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#003f5c"
                        onChangeText={(newEmail) => setEmail(newEmail)}
                        value={email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#003f5c"
                        onChangeText={(newPassword) => setPassword(newPassword)}
                        value={password}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        placeholderTextColor="#003f5c"
                        onChangeText={(newPhone) => setPhone(newPhone)}
                        value={phone}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity style={styles.loginButton} onPress={save}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <Text style={{ color: 'red', fontSize: 23, marginTop: 5, display: errorMessage ? 'flex' : 'none' }}>{errorMessage}</Text>
                    <Text style={{ color: 'green', fontSize: 23, marginTop: 5, display: successMessage ? 'flex' : 'none' }}>{errorMessage === "" ? successMessage : ""}</Text>
                </View>
            </View>
            <SongModal gapValue={25} />
        </LinearGradient>
    )
}

export default EditProfile

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
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 75
    },
    profileImagePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#CBCBCB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageText: {
        color: 'white',
        fontSize: 16,
    }
})