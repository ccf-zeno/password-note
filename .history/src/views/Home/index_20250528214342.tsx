import {StyleSheet} from 'react-native';
import {
  NativeBaseProvider,
  Input,
  Center,
  FlatList,
  Actionsheet,
  Box,
  Text,
  Button,
  HStack,
  View,
  ActionsheetItem,
} from 'native-base';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

import AddBtn from '@/components/AddBtn';
import NoteCard from '@/components/NoteCard';
import type {RootState} from '@/stores';
import {addNote, deleteNote} from '@/stores/note';
import {useMemo, useState} from 'react';
import type {Note} from '@/interface';

function generateId(length = 10) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function HomeScreen() {
  const [searchKey, setSearchKey] = useState<string>('');
  const notes = useSelector((state: RootState) => state.note.notes as Note[]);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filterNotes = useMemo(() => {
    if (searchKey === '') return notes;
    return notes.filter(note => note.description.includes(searchKey));
  }, [searchKey, notes]);

  const onCardPress = (id: string) => {
    navigation.navigate('NoteDetail', {id});
  };

  const onAddPress = () => {
    const id = generateId();
    dispatch(addNote({id, description: '', info: []}));
    setTimeout(() => navigation.navigate('NoteDetail', {id}));
  };

  const onNoteLongPress = (id: string) => {
    setSelectedId(id);
    setActionSheetVisible(true);
  };

  const onDeleteConfirm = () => {
    setDeleteConfirm(false);
    if (selectedId) {
      dispatch(deleteNote(selectedId));
      setSelectedId(null);
    }
  };

  const onCloseConfirm = () => {
    setDeleteConfirm(false);
    setSelectedId(null);
  };

  return (
    <NativeBaseProvider isSSR={false}>
      <Center style={styles.searchBar}>
        <Input
          value={searchKey}
          onChangeText={v => setSearchKey(v)}
          placeholder="输入关键词进行搜索"
        />
      </Center>

      <FlatList
        data={filterNotes}
        renderItem={({item}) => (
          <NoteCard
            title={item.description}
            style={styles.card}
            onPress={() => onCardPress(item.id)}
            onLongPress={() => onNoteLongPress(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        style={styles.cardSection}
      />

      <AddBtn style={styles.addBtn} onPress={onAddPress} />

      {/* 操作选项 ActionSheet */}
      <Actionsheet
        isOpen={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}>
        <Actionsheet.Content>
          <Actionsheet.Item
            onPress={() => {
              setActionSheetVisible(false);
              if (selectedId)
                navigation.navigate('NoteDetail', {id: selectedId});
            }}>
            编辑
          </Actionsheet.Item>
          <Actionsheet.Item
            onPress={() => {
              setActionSheetVisible(false);
              setDeleteConfirm(true);
            }}>
            删除
          </Actionsheet.Item>
          <Actionsheet.Item onPress={() => setActionSheetVisible(false)}>
            取消
          </Actionsheet.Item>
        </Actionsheet.Content>
      </Actionsheet>

      {/* 删除确认 ActionSheet */}
      <Actionsheet
        isOpen={deleteConfirm}
        onClose={onCloseConfirm}
        hideDragIndicator
        >
        <Actionsheet.Content>
          <Box w="100%" h={60} px={4} justifyContent="center">
            <Text fontSize="16" color="gray.500" _dark={{color: 'gray.300'}}>
              确认是否需要删除
            </Text>
          </Box>

          <Box w="100%" px={4} pb={4}>
            <HStack space={4} justifyContent="space-between">
              <Button flex={1} variant="outline" onPress={onCloseConfirm}>
                取消
              </Button>
              <Button flex={1} colorScheme="danger" onPress={onDeleteConfirm}>
                删除
              </Button>
            </HStack>
          </Box>
        </Actionsheet.Content>
      </Actionsheet>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  cardSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 16,
  },
  card: {
    marginBottom: 12,
  },
  addBtn: {
    position: 'absolute',
    bottom: 40,
    right: 40,
  },
});

export default HomeScreen;
