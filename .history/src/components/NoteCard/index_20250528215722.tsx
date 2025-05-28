import {Box, HStack, VStack, Text, Pressable} from 'native-base';

interface Props {
  title: string;
  preview?: string;
  time?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: any;
}

const NoteCard = ({
  title,
  preview,
  time,
  onPress,
  onLongPress,
  style,
}: Props) => {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      {({isPressed}) => (
        <Box
          bg="white"
          p="4"
          borderRadius="xl"
          shadow={isPressed ? 3 : 1}
          style={style}
          borderWidth={1}
          borderColor="gray.100">
          <HStack space={3} alignItems="center">
            <VStack flex={1}>
              <Text bold fontSize="md" isTruncated>
                {title || '未命名笔记'}
              </Text>
              {preview ? (
                <Text
                  fontSize="sm"
                  color="gray.500"
                  isTruncated
                  numberOfLines={1}>
                  {preview}
                </Text>
              ) : null}
              {time ? (
                <Text fontSize="xs" color="gray.400">
                  {time}
                </Text>
              ) : null}
            </VStack>
          </HStack>
        </Box>
      )}
    </Pressable>
  );
};

export default NoteCard;
