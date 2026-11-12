import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  designTokens,
  displayFontFamily,
} from '@/constants/designTokens';

interface StartupSplashProps {
  displayDurationMs: number;
  onFinished: () => void;
}

const DOT_COUNT = 3;
const DOT_INTERVAL_MS = 150;
const FADE_DURATION_MS = 600;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
    elevation: 20,
  },
  image: {
    ...StyleSheet.absoluteFill,
    flex: 1,
  },
  wordmark: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  title: {
    color: designTokens.color.foreground,
    fontFamily: displayFontFamily,
    fontSize: 18,
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  dots: {
    marginTop: 8,
    color: designTokens.color.accent,
    fontFamily: displayFontFamily,
    fontSize: 20,
    lineHeight: 22,
    letterSpacing: 4,
    textAlign: 'center',
  },
});

export default function StartupSplash({
  displayDurationMs,
  onFinished,
}: StartupSplashProps) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(1)).current;
  const [activeDots, setActiveDots] = useState(1);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    if (!imageReady) return;

    const dotTimer = setInterval(() => {
      setActiveDots((current) => (current % DOT_COUNT) + 1);
    }, DOT_INTERVAL_MS);

    let fade: Animated.CompositeAnimation | undefined;
    const fadeTimer = setTimeout(() => {
      fade = Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: Platform.OS !== 'web',
      });
      fade.start(({ finished }) => {
        if (finished) onFinished();
      });
    }, displayDurationMs);

    return () => {
      clearInterval(dotTimer);
      clearTimeout(fadeTimer);
      fade?.stop();
    };
  }, [displayDurationMs, imageReady, onFinished, opacity]);

  return (
    <Animated.View
      accessibilityLabel="Sunday Drive loading"
      accessible
      pointerEvents="none"
      style={[styles.overlay, { opacity }]}
      testID="startup-splash"
    >
      <View style={styles.image}>
        <Image
          source={require('../assets/images/sunday-drive-loading.jpg')}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          accessible={false}
          testID="startup-splash-image"
          onLoadEnd={() => setImageReady(true)}
        />
        <View style={[styles.wordmark, { bottom: insets.bottom + 76 }]}>
          <Text style={styles.title}>SUNDAY DRIVE</Text>
          <Text style={styles.dots}>{'.'.repeat(activeDots)}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
