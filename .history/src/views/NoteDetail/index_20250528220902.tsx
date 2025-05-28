import {StyleSheet, View, ScrollView} from 'react-native';
import {
  NativeBaseProvider,
  FormControl,
  AddIcon,
  Button,
  Text,
  Pressable,
  Modal,
  Input as InputBase,
  Menu,
  Box,
  useToast,
} from 'native-base';
import Clipboard from '@react-native-clipboard/clipboard';
import {useEffect, useMemo, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import type {RootState} from '@/stores';

import type {FC} from 'react';
import {useRoute, useNavigation} from '@react-navigation/native';
import {Note} from '@/interface';
import {updateNote, addNote} from '@/stores/note';

interface Info {
  label: string;
  value: string;
}

type Props = {};

const NoteDetail: FC<Props> = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();

  const notes = useSelector((state: RootState) => state.note.notes);

  // 从路由参数拿 id
  const id = useMemo(() => {
    return route.params?.id as string;
  }, [route]);

  // 找到笔记在数组中的索引
  const noteIndex = useMemo(() => {
    return notes.findIndex(note => note.id === id);
  }, [id, notes]);

  // 拿到笔记，如果没找到返回 undefined
  const note: Note | undefined = useMemo(() => {
    if (noteIndex === -1) return undefined;
    return notes[noteIndex];
  }, [notes, noteIndex]);

  // 控制弹窗可见性，编辑项索引和编辑内容状态
  const [visible, setVisible] = useState(false);
  const [edit, setEdit] = useState<number | null>(null);
  const [editInfo, setEditInfo] = useState<Info>({label: '', value: ''});

  // 如果id是'new'，新建笔记，生成新id，dispatch后替换路由参数，触发组件重新渲染
  useEffect(() => {
    if (id === 'new') {
      const newId = generateId();
      dispatch(addNote({id: newId, description: '', info: []}));
      navigation.setParams({id: newId});
    }
  }, [id, dispatch, navigation]);

  // 设置页面标题，防止note为undefined
  useEffect(() => {
    navigation.setOptions({
      title: note?.description ?? '笔记详情',
    });
  }, [navigation, note]);

  // 设置描述，注意先判断note是否存在
  const setDesc = (v: string) => {
    if (!note) return;
    dispatch(
      updateNote({
        id,
        description: v,
        info: note.info,
      }),
    );
  };

  // 设置info列表，同样先判断note是否存在
  const setInfoList = (v: Info[]) => {
    if (!note) return;
    dispatch(
      updateNote({
        id,
        description: note.description,
        info: v,
      }),
    );
  };

  const onAddCountPress = () => {
    setVisible(true);
    setEdit(null);
    setEditInfo({label: '', value: ''});
  };

  const onModalCancelPress = () => {
    setVisible(false);
    setEdit(null);
    setEditInfo({label: '', value: ''});
  };

  const onModalOkPress = () => {
    if (!note) return;
    const _info = [...note.info];
    if (edit === null) {
      _info.push(editInfo);
    } else {
      _info[edit] = editInfo;
    }
    setInfoList(_info);
    setVisible(false);
    setEdit(null);
    setEditInfo({label: '', value: ''});
  };

  const onEditPress = (index: number) => {
    if (!note) return;
    setVisible(true);
    setEdit(index);
    const info = note.info[index];
    setEditInfo({label: info.label, value: info.value});
  };

  const onDeletePress = (index: number) => {
    if (!note) return;
    const _info = [...note.info];
    _info.splice(index, 1);
    setInfoList(_info);
  };

  const onCopyPress = (text: string) => {
    Clipboard.setString(text);
    toast.show({
      description: '复制成功',
    });
  };

  // 如果note不存在，提示或者返回null避免报错
  if (!note) {
    return (
      <NativeBaseProvider>
        <View style={styles.page}>
          <Text>笔记不存在或正在加载...</Text>
        </View>
      </NativeBaseProvider>
    );
  }

  return (
    <NativeBaseProvider>
      <ScrollView style={styles.page}>
        <View style={styles.title}>
          <Text bold fontSize="xl">
            描述
          </Text>

          <FormControl>
            <InputBase
              value={note.description}
              onChangeText={text => setDesc(text)}
              flex={1}
              variant="underlined"
              padding={0}
              placeholder="用于快捷搜索"
            />
          </FormControl>
        </View>

        <View>
          <Text bold fontSize="xl">
            全部信息
          </Text>
          <FormControl>
            <View style={styles.inputSection}>
              {(note.info ?? []).map((info, index) => (
                <Menu
                  key={index}
                  placement="bottom right"
                  trigger={(triggerProps, {open}) => (
                    <Pressable {...triggerProps}>
                      <Box
                        style={[styles.infoBox, open && styles.infoBoxSelect]}
                        padding={1}>
                        <View style={{flex: 1}}>
                          <Text fontSize="2xl">{info.value}</Text>
                          {info.label ? (
                            <Text style={styles.labelText}>{info.label}</Text>
                          ) : null}
                        </View>

                        <Button
                          padding={2}
                          size="md"
                          onPress={() => onCopyPress(info.value)}>
                          复制
                        </Button>
                      </Box>
                    </Pressable>
                  )}>
                  <Menu.Item onPress={() => onEditPress(index)}>编辑</Menu.Item>
                  <Menu.Item onPress={() => onDeletePress(index)}>
                    删除
                  </Menu.Item>
                </Menu>
              ))}
            </View>

            <View>
              <Button
                leftIcon={<AddIcon style={styles.addIcon} />}
                style={styles.addBtn}
                size="lg"
                padding={1}
                onPress={onAddCountPress}>
                新增
              </Button>
            </View>
          </FormControl>

          <Modal isOpen={visible} onClose={onModalCancelPress}>
            <Modal.Content padding={4}>
              <FormControl>
                <FormControl.Label>标题</FormControl.Label>
                <InputBase
                  value={editInfo.label}
                  onChangeText={text => setEditInfo({...editInfo, label: text})}
                  placeholder="一个标记，可以为空"
                />
              </FormControl>
              <FormControl>
                <FormControl.Label>信息</FormControl.Label>
                <InputBase
                  value={editInfo.value}
                  onChangeText={text => setEditInfo({...editInfo, value: text})}
                  placeholder="具体保存的信息"
                />
              </FormControl>

              <View style={styles.footer}>
                <Button padding={2} onPress={onModalCancelPress}>
                  取消
                </Button>
                <Button padding={2} onPress={onModalOkPress}>
                  确认
                </Button>
              </View>
            </Modal.Content>
          </Modal>
        </View>
      </ScrollView>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 16,
  },
  infoBox: {
    borderColor: '#22D3EE',
    borderWidth: 1,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 12,
    paddingRight: 12,
  },
  infoBoxSelect: {
    backgroundColor: '#e0f7fa',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    marginBottom: 12,
    marginTop: 12,
  },
  addIcon: {
    width: 12,
  },
  addBtn: {
    width: 80,
    marginTop: 12,
  },
  inputSection: {
    flexDirection: 'column',
    gap: 4,
    marginTop: 12,
  },
  labelText: {
    color: 'gray',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
});

export default NoteDetail;

// 生成随机id函数
function generateId(length = 10) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
