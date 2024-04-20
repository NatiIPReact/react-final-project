import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

function GetFirstLettersOfName(name) {
    let s = name.split(' ');
    let res = '';
    let counter = 0;
    for (i in s) {
        if (counter > 2)
            break;
        res += s[i][0] === undefined ? "" : s[i][0];
        counter += s[i][0] === undefined;
    }
    return res;
}

const ProfilePicture = ({ name }) => {
  return (
    <View style={styles.circle}>
      <LinearGradient
        colors={['rgb(32, 167, 196)', 'rgb(59, 200, 231)', 'rgb(59, 200, 231)', 'rgb(32, 167, 196)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.text}>{GetFirstLettersOfName(name)}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 65,
    height: 65,
    borderRadius: 50,
    overflow: 'hidden', // This is important to clip the gradient to the circle shape
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfilePicture;
