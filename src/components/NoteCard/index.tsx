import type {FC} from 'react';
import {StyleSheet, Text} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {Box, Pressable} from 'native-base';

interface NoteCardProps {
  title: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const NoteCard: FC<NoteCardProps> = props => {
  const {title, style = {}, onPress} = props;

  return (
    <Pressable onPress={onPress}>
      {({isHovered, isFocused, isPressed}) => (
        <Box
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
          ]}>
          <Text style={styles.text}>{title}</Text>
        </Box>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    width: '100%',
    padding: 16,
    borderRadius: 6,
  },
  text: {
    fontSize: 14,
    color: 'black',
  },
});

export default NoteCard;
