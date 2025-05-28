import type {FC} from 'react';
import {StyleSheet, Text} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {Box, Button, Pressable, View} from 'native-base';

interface NoteCardProps {
  title: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onDeletePress?:()=>void;
}

const NoteCard: FC<NoteCardProps> = props => {
  const {title, style = {}, onPress,onDeletePress} = props;

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
          <View style={{flex: 1}}>
            <Text style={styles.text}>{title}</Text>
          </View>

          <Button size="md" padding={1} onPress={onDeletePress}>
            删除
          </Button>
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
