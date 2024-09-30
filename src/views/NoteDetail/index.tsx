import {StyleSheet, View, Text, ScrollView} from 'react-native';
import {
  NativeBaseProvider,
  FormControl,
  AddIcon,
  IconButton,
  Button,
  Stack,
  InputGroup,
  InputRightAddon,
} from 'native-base';
import {useState, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import type {FC} from 'react';
import Input from '@/components/Input';

type Props = {};
const NoteDetail: FC<Props> = props => {
  const {} = props;

  const [desc, setDesc] = useState<string>('');
  const [accountList, setAccountList] = useState<string[]>(['']);
  const route = useRoute();

  const {mode = 'add', otherParam} = route.params || ({} as any);

  const onAddCountPress = () => {
    accountList.push('');
    setAccountList([...accountList]);
  };

  return (
    <NativeBaseProvider>
      <ScrollView style={styles.page}>
        <View>
          <FormControl>
            <FormControl.Label>描述</FormControl.Label>
            <Input
              value={desc}
              onChangeText={text => {
                setDesc(text);
              }}
              flex={1}
              variant="underlined"
              padding={0}
            />

            <FormControl.HelperText>用于快捷搜索</FormControl.HelperText>
          </FormControl>
        </View>
        <View>
          <FormControl>
            <FormControl.Label>账号</FormControl.Label>
            {accountList.map((account, index) => {
              return (
                <Input
                  key={index}
                  value={account}
                  onChangeText={text => {
                    accountList[index] = text;
                    setAccountList([...accountList]);
                  }}
                  style={styles.accountInput}
                />
              );
            })}

            <View>
              <Button
                leftIcon={<AddIcon style={styles.addIcon} />}
                style={styles.addBtn}
                size="sm"
                padding={1}
                onPress={onAddCountPress}>
                新增
              </Button>
            </View>
          </FormControl>
        </View>
      </ScrollView>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 16,
  },
  addIcon: {
    width: 12,
  },
  addBtn: {
    width: 60,
    marginTop: 4,
  },
  accountInput: {
    marginBottom: 4,
  },
  input: {},
});

export default NoteDetail;
