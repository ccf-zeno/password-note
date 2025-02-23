import type {FC} from 'react';
import {HStack, Input as InputBase, Button} from 'native-base';

interface Props {
  showCopy?: boolean;
  placeholder?: string;
  onCopyPress?: () => void;
  onChangeText?: () => void;
}

const Input: FC<Props> = props => {
  const {showCopy = false, placeholder, onCopyPress} = props;

  return (
    <HStack space={1}>
      <InputBase
        size="md"
        variant="underlined"
        flex={1}
        padding={0}
        placeholder={placeholder}
        onChangeText={onChangeText}
      />
      {showCopy ? (
        <Button size="xs" onPress={onCopyPress}>
          复制
        </Button>
      ) : null}
    </HStack>
  );
};

export default Input;
