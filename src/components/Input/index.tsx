import type {FC} from 'react';
import {HStack, Input as InputBase, Button} from 'native-base';

interface Props {
  showDelete?: boolean;
}

const Input: FC<Props> = props => {
  const {showDelete = false} = props;

  return (
    <HStack space={1}>
      <InputBase variant="underlined" flex={1} padding={0} />
      <Button size="xs" >复制</Button>
      {showDelete ? <Button size="xs">删除</Button> : null}
    </HStack>
  );
};

export default Input;
