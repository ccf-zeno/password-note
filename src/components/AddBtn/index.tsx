import type {FC} from 'react';
import {StyleSheet, Text} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {Box, Pressable, IconButton, Icon, AddIcon} from 'native-base';

interface NoteCardProps {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const AddBtn: FC<NoteCardProps> = props => {
  const {title, style = {}, onPress} = props;

  return (
    <Pressable>
      {({isHovered, isFocused, isPressed}) => (
        <IconButton
          icon={<AddIcon />}
          bg={isPressed ? 'coolGray.200' : 'white'}
          style={[
            style,
            styles.box,
            {
              transform: [
                {
                  scale: isPressed ? 0.98 : 1,
                },
              ],
            },
          ]}
          onPress={onPress}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
});

export default AddBtn;
