import {StyleSheet, TouchableOpacity, View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type {ReactNode} from 'react';

const HEADER_CONTENT_HEIGHT = 44;

interface Props {
  title?: string;
  onBack?: () => void;
  rightAction?: ReactNode;
}

const Header = ({title = '', onBack, rightAction}: Props) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBack = onBack || (() => navigation.goBack());

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.inner}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          style={styles.backBtn}>
          <MaterialIcons name="chevron-left" size={28} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {rightAction && <View style={styles.rightWrap}>{rightAction}</View>}
      </View>
    </View>
  );
};

export const HEADER_HEIGHT_CONTENT = HEADER_CONTENT_HEIGHT;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  inner: {
    height: HEADER_CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  backBtn: {
    width: 36,
    height: HEADER_CONTENT_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    height: HEADER_CONTENT_HEIGHT,
    justifyContent: 'center',
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    includeFontPadding: false,
    transform: [{translateY: -1}],
  },
  rightWrap: {
    height: HEADER_CONTENT_HEIGHT,
    justifyContent: 'center',
    paddingRight: 12,
  },
});

export default Header;
