import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, ScrollView, View} from 'react-native';
import {
  NativeBaseProvider,
  Box,
  Button,
  FormControl,
  Input,
  Text,
  VStack,
  HStack,
  IconButton,
  Icon,
  useToast,
  Modal,
  Pressable,
} from 'native-base';
import Clipboard from '@react-native-clipboard/clipboard';
import {useSelector, useDispatch} from 'react-redux';
import {useRoute, useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import type {RootState} from '@/stores';
import {updateNote, addNote} from '@/stores/note';
import type {Note} from '@/interface';

interface Info {
  label: string;
  value: string;
}

const NoteDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const toast = useToast();
  const dispatch = useDispatch();

  const notes = useSelector((state: RootState) => state.note.notes);

  const routeId = route.params?.id as string;

  const [currentId, setCurrentId] = useState<string>(routeId);
  const [visible, setVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editInfo, setEditInfo] = useState<Info>({label: '', value: ''});

  // 获取当前笔记index和数据
  const noteIndex = useMemo(
    () => notes.findIndex(note => note.id === currentId),
    [notes, currentId],
  );
  const note: Note | undefined =
    noteIndex !== -1 ? notes[noteIndex] : undefined;

  // 初始化新建笔记id
  useEffect(() => {
    if (currentId === 'new') {
      const newId = generateId();
      dispatch(addNote({id: newId, description: '', info: []}));
      setCurrentId(newId);
      navigation.setParams({id: newId});
    }
  }, [currentId, dispatch, navigation]);

  // 设置导航标题
  useEffect(() => {
    navigation.setOptions({
      title: note?.description?.trim() || '笔记详情',
    });
  }, [note?.description, navigation]);

  if (!note) {
    return (
      <NativeBaseProvider>
        <Box flex={1} justifyContent="center" alignItems="center">
          <Text>笔记不存在</Text>
        </Box>
      </NativeBaseProvider>
    );
  }

  // 更新笔记描述
  const setDesc = (text: string) => {
    dispatch(updateNote({id: currentId, description: text, info: note.info}));
  };

  // 更新信息列表
  const setInfoList = (infoList: Info[]) => {
    dispatch(
      updateNote({
        id: currentId,
        description: note.description,
        info: infoList,
      }),
    );
  };

  // 新增或编辑弹窗确认
  const onModalOkPress = () => {
    const newInfo = [...note.info];
    if (editIndex === null) {
      if (!editInfo.value.trim()) {
        toast.show({
          description: '信息内容不能为空',
          placement: 'bottom',
          duration: 3000,
        });
        return;
      }
      newInfo.push(editInfo);
    } else {
      if (!editInfo.value.trim()) {
        toast.show({
          description: '信息内容不能为空',
          placement: 'bottom',
          duration: 3000,
        });
        return;
      }
      newInfo[editIndex] = editInfo;
    }
    setInfoList(newInfo);
    setVisible(false);
    setEditInfo({label: '', value: ''});
    setEditIndex(null);
  };

  // 打开编辑弹窗
  const onEditPress = (index: number) => {
    setEditIndex(index);
    setEditInfo(note.info[index]);
    setVisible(true);
  };

  // 删除信息项
  const onDeletePress = (index: number) => {
    const newInfo = [...note.info];
    newInfo.splice(index, 1);
    setInfoList(newInfo);
    toast.show({description: '已删除'});
  };

  // 复制信息内容
  const onCopyPress = (text: string) => {
    Clipboard.setString(text);
    toast.show({description: '复制成功'});
  };

  // 打开新增弹窗
  const onAddPress = () => {
    setEditInfo({label: '', value: ''});
    setEditIndex(null);
    setVisible(true);
  };

  return (
    <NativeBaseProvider>
      <ScrollView style={styles.page} keyboardShouldPersistTaps="handled">
        {/* 描述输入框 */}
        <Box bg="white" p={4} borderRadius="xl" shadow={1} mb={6}>
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            描述
          </Text>
          <Input
            placeholder="请输入笔记描述"
            variant="filled"
            borderRadius="md"
            fontSize="md"
            value={note.description}
            onChangeText={setDesc}
            clearButtonMode="while-editing"
          />
        </Box>

        {/* 全部信息列表 */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={3}>
            全部信息
          </Text>

          {note.info.length === 0 ? (
            <Text color="gray.400" italic mb={4}>
              暂无信息，点击下方新增按钮添加
            </Text>
          ) : (
            <VStack space={3} mb={4}>
              {note.info.map((info, index) => (
                <Box
                  key={index}
                  bg="gray.50"
                  p={4}
                  borderRadius="md"
                  shadow={0}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between">
                  <VStack flex={1} mr={3}>
                    <Text fontSize="md" fontWeight="medium" isTruncated>
                      {info.value}
                    </Text>
                    {info.label ? (
                      <Text fontSize="sm" color="gray.500" isTruncated>
                        {info.label}
                      </Text>
                    ) : null}
                  </VStack>

                  <HStack space={1}>
                    <IconButton
                      icon={<Icon as={MaterialIcons} name="content-copy" />}
                      borderRadius="full"

                      onPress={() => onCopyPress(info.value)}

                      accessibilityLabel="复制信息"
                    />
                    <IconButton
                      icon={<Icon as={MaterialIcons} name="edit" />}

                      onPress={() => onEditPress(index)}
    
                      accessibilityLabel="编辑信息"
                    />
                    <IconButton
                      icon={<Icon as={MaterialIcons} name="delete" />}
                      borderRadius="full"

                      onPress={() => onDeletePress(index)}
                      accessibilityLabel="删除信息"
                    />
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}

          <Button onPress={onAddPress} borderRadius="md" size="lg" w="full">
            新增
          </Button>
        </Box>

        {/* 编辑/新增信息弹窗 */}
        <Modal isOpen={visible} onClose={() => setVisible(false)} avoidKeyboard>
          <Modal.Content
            maxWidth="400px"
            bg="white"
            borderRadius="lg"
            shadow={3}
            _dark={{bg: 'gray.800'}}>
            <Modal.Body pt={6} px={4} pb={6}>
              <FormControl mb={4}>
                <FormControl.Label>标题（可选）</FormControl.Label>
                <Input
                  placeholder="一个标记，可以为空"
                  value={editInfo.label}
                  onChangeText={text => setEditInfo({...editInfo, label: text})}
                  autoFocus
                  borderRadius="md"
                  variant="filled"
                />
              </FormControl>
              <FormControl isRequired>
                <FormControl.Label>信息内容</FormControl.Label>
                <Input
                  placeholder="具体保存的信息"
                  value={editInfo.value}
                  onChangeText={text => setEditInfo({...editInfo, value: text})}
                  borderRadius="md"
                  variant="filled"
                />
              </FormControl>
            </Modal.Body>
            <Modal.Footer
              borderTopWidth={0}
              px={4}
              py={3}
              justifyContent="flex-end"
              space={2}
              bg="white">
              <Button
                variant="ghost"
                colorScheme="coolGray"
                onPress={() => setVisible(false)}
                mr={3}
                px={5}>
                取消
              </Button>
              <Button
                onPress={onModalOkPress}
                px={6}
                colorScheme="primary"
                variant="solid">
                确认
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </ScrollView>
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});

function generateId(length = 10) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export default NoteDetail;
