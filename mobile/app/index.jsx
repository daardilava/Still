import { useEffect, useState } from 'react';
import { BackHandler, Platform, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import StillWeb from '../components/still-web';

const BG = { light: '#E9E5F3', dark: '#1F1A35' };

export default function Index() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const insets = useSafeAreaInsets();
  const [appDark, setAppDark] = useState(scheme === 'dark');
  const [backSignal, setBackSignal] = useState(0);

  // Android back button: let Still close its top sheet/screen first; it asks to exit when there's nowhere to go.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { setBackSignal((n) => n + 1); return true; });
    return () => sub.remove();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: appDark ? BG.dark : BG.light }}>
      <StatusBar style={appDark ? 'light' : 'dark'} />
      <StillWeb
        platform={Platform.OS === 'ios' ? 'ios' : 'android'}
        scheme={scheme}
        insets={{ top: insets.top, bottom: insets.bottom }}
        backSignal={backSignal}
        haptic={async (kind) => {
          if (kind === 'success') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          else await Haptics.selectionAsync();
        }}
        onTheme={async (dark) => setAppDark(!!dark)}
        exitApp={async () => BackHandler.exitApp()}
        dom={{
          style: { flex: 1, backgroundColor: 'transparent' },
          scrollEnabled: false,
          bounces: false,
          overScrollMode: 'never',
          contentInsetAdjustmentBehavior: 'never',
          automaticallyAdjustContentInsets: false
        }}
      />
    </View>
  );
}
