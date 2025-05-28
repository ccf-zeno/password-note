import type {FC} from 'react';
import {StyleSheet, Text} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {Box, Pressable, View} from 'native-base';

interface NoteCardProps {
  title: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
}

const NoteCard: FC<NoteCardProps> = props => {
  const {title, style = {}, onPress, onLongPress} = props;

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
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
          <View style={{flex: 1}}>
            <Text style={styles.text}>{title}</Text>
          </View>
        </Box>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  box: {
    width: '100%',
    borderRadius: 6,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 16,
    paddingRight: 16,
  },
  text: {
    fontSize: 14,
    color: 'black',
  },
});

export default NoteCard;
