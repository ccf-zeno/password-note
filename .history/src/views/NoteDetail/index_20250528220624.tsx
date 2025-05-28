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
import {useRoute} from '@react-navigation/native';
import {Note} from '@/interface';
import {updateNote,addNote} from '@/stores/note';
import {useNavigation} from '@react-navigation/native';

interface Info {
  label: string;
  value: string;
}

type Props = {};
const NoteDetail: FC<Props> = props => {
  const {} = props;

  const route = useRoute();
  const notes = useSelector((state: RootState) => state.note.notes);
  const id = useMemo(() => {
    return route.params.id;
  }, [route]);

  const noteIndex = useMemo(() => {
    return notes.findIndex(note => note.id === id);
  }, [id, notes]);

  const note: Note = useMemo(() => {
    return notes[noteIndex];
  }, [notes, noteIndex]);

  const [visible, setVisible] = useState<boolean>(false);
  const [edit, setEdit] = useState<number | null>(null);
  const [editInfo, setEditInfo] = useState<Info>({
    label: '',
    value: '',
  });

  const toast = useToast();

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const setDesc = v => {
    dispatch(
      updateNote({
        id,
        description: v,
        info: note.info,
      }),
    );
  };

  const setInfoList = v => {
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
  };

  const onModalCancelPress = () => {
    setVisible(false);
    setEdit(null);
    setEditInfo({
      label: '',
      value: '',
    });
  };

  const onModalOkPress = () => {
    const _info = [...note.info];

    if (edit === null) {
      _info.push(editInfo);
    } else {
      _info[edit] = editInfo;
    }

    setInfoList(_info);

    setVisible(false);
    setEdit(null);
    setEditInfo({
      label: '',
      value: '',
    });
  };

  const onEditPress = (index: number) => {
    setVisible(true);
    setEdit(index);
    const info = note.info[index];
    setEditInfo({
      label: info.label,
      value: info.value,
    });
  };

  const onDeletePress = (index: number) => {
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

  useEffect(() => {
    navigation.setOptions({
      title: note.description,
    });
  }, [navigation, note.description]);

    useEffect(() => {
    if (id === 'new') {
      const newId = generateId();
      dispatch(addNote({ id: newId, description: '', info: [] }));
      // 把 id 替换成真正新建的 id，避免后续操作用到 'new'
      navigation.setParams({ id: newId });
    }
  }, []);

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
              onChangeText={text => {
                setDesc(text);
              }}
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
              {note.info.map((info, index) => {
                return (
                  <Menu
                    key={index}
                    placement="bottom right"
                    trigger={(triggerProps, {open}) => {
                      return (
                        <Pressable {...triggerProps}>
                          <Box
                            style={[
                              styles.infoBox,
                              open && styles.infoBoxSelect,
                            ]}
                            padding={1}>
                            <View style={{flex: 1}}>
                              <Text fontSize="2xl">{info.value}</Text>
                              {info.label ? (
                                <Text style={styles.labelText}>
                                  {info.label}
                                </Text>
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
                      );
                    }}>
                    <Menu.Item onPress={() => onEditPress(index)}>
                      编辑
                    </Menu.Item>
                    <Menu.Item onPress={() => onDeletePress(index)}>
                      删除
                    </Menu.Item>
                  </Menu>
                );
              })}
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

          <Modal
            isOpen={visible}
            onClose={() => {
              setVisible(false);
            }}>
            <Modal.Content padding={4}>
              <FormControl>
                <FormControl.Label>标题</FormControl.Label>
                <InputBase
                  value={editInfo.label}
                  onChangeText={text => {
                    setEditInfo({
                      ...editInfo,
                      label: text,
                    });
                  }}
                  placeholder="一个标记，可以为空"
                />
              </FormControl>
              <FormControl>
                <FormControl.Label>信息</FormControl.Label>
                <InputBase
                  value={editInfo.value}
                  onChangeText={text => {
                    setEditInfo({
                      ...editInfo,
                      value: text,
                    });
                  }}
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 12,
    paddingRight: 12,
  },
  infoBoxSelect: {
    backgroundColor: '#e0f7fa', // 选中卡片的背景颜色，可以改成其他颜色
    shadowOpacity: 0.3, // 增加阴影的强度
    shadowRadius: 8, // 增加阴影的扩展
    elevation: 5, // Android 阴影强度更高
  },
  copyBtn: {},
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
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginTop: 12,
  },
  labelText: {
    color: 'gray',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
});

export default NoteDetail;


function generateId(length = 10) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}