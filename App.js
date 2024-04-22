import { StyleSheet, Text, View } from 'react-native';
import Navigation from './StackNavigator';
import { GlobalStateProvider } from './components/user';
import { ModalPortal } from 'react-native-modals';
import { AudioPlayerContext } from './AudioPlayer';
import { PlaylistsGlobalStateProvider } from './Playlists';
import { LikedSongsGlobalStateProvider } from './LikedSongs';
import { XPGlobalStateProvider } from './xp';

export default function App() {
  return (
    <>
      <XPGlobalStateProvider>
        <LikedSongsGlobalStateProvider>
          <PlaylistsGlobalStateProvider>
            <AudioPlayerContext>
              <GlobalStateProvider>
                <Navigation />
                <ModalPortal />
              </GlobalStateProvider>
            </AudioPlayerContext>
          </PlaylistsGlobalStateProvider>
        </LikedSongsGlobalStateProvider>
      </XPGlobalStateProvider>
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
