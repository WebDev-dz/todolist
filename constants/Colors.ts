/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    button: '#A1CEDC',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    recorderBackground: '#cfd4dd',
    recorderProgress: '#fff',
    recorderTimeline: 'rgba(0, 0, 0, 0.5)',
    recorderTint: tintColorLight,
    recorderWaveformInactive: '#687076',
    recorderSheet: '#f9f9f9',
    recorderIcon: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    button: '#1D3D47',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    recorderBackground: '#20242c',
    recorderProgress: 'rgba(13, 14, 17, 0.5)',
    recorderTimeline: 'rgba(255, 255, 255, 0.5)',
    recorderTint: tintColorLight,
    recorderWaveformInactive: '#7987a0',
    recorderSheet: '#282e37',
    recorderIcon: tintColorDark,
  },
}