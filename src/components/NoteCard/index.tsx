import {Pressable, StyleSheet} from 'react-native';
import {Text, XStack} from 'tamagui';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface Props {
  title: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: any;
  selected?: boolean;
  showCheckbox?: boolean;
}

const NoteCard = ({
  title,
  onPress,
  onLongPress,
  style,
  selected,
  showCheckbox,
}: Props) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={200}
      style={({pressed}) => [
        styles.card,
        style,
        pressed && styles.pressed,
        showCheckbox && selected && styles.cardSelected,
      ]}>
      <XStack alignItems="center" height={22}>
        {showCheckbox ? (
          <MaterialIcons
            name={selected ? 'check-circle' : 'radio-button-unchecked'}
            size={22}
            color={selected ? '#6366f1' : '#cbd5e1'}
            style={styles.checkbox}
          />
        ) : null}
        <Text flex={1} fontSize={16} fontWeight="600" color="#1e293b" numberOfLines={1}>
          {title || '未命名笔记'}
        </Text>
        {!showCheckbox ? (
          <MaterialIcons name="chevron-right" size={22} color="#cbd5e1" />
        ) : null}
      </XStack>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#0f172a',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    backgroundColor: '#f8fafc',
    transform: [{scale: 0.98}],
  },
  cardSelected: {
    backgroundColor: '#eef2ff',
  },
  checkbox: {
    marginRight: 10,
  },
});

export default NoteCard;
