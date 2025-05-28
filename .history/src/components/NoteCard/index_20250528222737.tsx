import {Box, HStack, VStack, Text, Pressable} from 'native-base';

interface Props {
  title: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: any;
}

const NoteCard = ({title, onPress, onLongPress, style}: Props) => {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} delayLongPress={100}>
      {({isPressed}) => (
        <Box
          bg="white"
          p="4"
          borderRadius="xl"
          shadow={isPressed ? 3 : undefined}
          style={style}
          borderWidth={1}
          borderColor="gray.100">
          <HStack space={3} alignItems="center">
            <VStack flex={1}>
              <Text bold fontSize="md" isTruncated>
                {title || '未命名笔记'}
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}
    </Pressable>
  );
};

export default NoteCard;
