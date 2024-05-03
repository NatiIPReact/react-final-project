import { StyleSheet, Text, View } from 'react-native';
import Navigation from './StackNavigator';
import { GlobalStateProvider } from './components/user';
import { ModalPortal } from 'react-native-modals';
import { AudioPlayerContext } from './AudioPlayer';
import { PlaylistsGlobalStateProvider } from './Playlists';
import { LikedSongsGlobalStateProvider } from './LikedSongs';
import { XPGlobalStateProvider } from './xp';
import { RecommendedGlobalStateProvider } from './Recommended';
import { RecentlyPlayedGlobalStateProvider } from './RecentlyPlayed';

export default function App() {
  return (
    <>
      <RecommendedGlobalStateProvider>
        <XPGlobalStateProvider>
          <RecentlyPlayedGlobalStateProvider>
            <LikedSongsGlobalStateProvider>
              <PlaylistsGlobalStateProvider>
                <GlobalStateProvider>
                  <AudioPlayerContext>
                    <Navigation />
                    <ModalPortal />
                  </AudioPlayerContext>
                </GlobalStateProvider>
              </PlaylistsGlobalStateProvider>
            </LikedSongsGlobalStateProvider>
          </RecentlyPlayedGlobalStateProvider>
        </XPGlobalStateProvider>
      </RecommendedGlobalStateProvider>
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
