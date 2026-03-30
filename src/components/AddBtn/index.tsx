import type {FC} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface AddBtnProps {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const AddBtn: FC<AddBtnProps> = ({style, onPress}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [styles.btn, style, pressed && styles.pressed]}>
      <MaterialIcons name="add" size={28} color="#fff" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  pressed: {
    transform: [{scale: 0.9}],
    backgroundColor: '#4f46e5',
  },
});

export default AddBtn;
