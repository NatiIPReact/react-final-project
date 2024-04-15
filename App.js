import { StyleSheet, Text, View } from 'react-native';
import Navigation from './StackNavigator';
import { GlobalStateProvider } from './components/user';
import { ModalPortal } from 'react-native-modals';
import { AudioPlayerContext } from './AudioPlayer';

export default function App() {
  return (
    <>
        <AudioPlayerContext>
          <GlobalStateProvider>
            <Navigation />
            <ModalPortal />
          </GlobalStateProvider>
        </AudioPlayerContext>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
