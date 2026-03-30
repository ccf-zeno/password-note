import {StyleSheet} from 'react-native';
import {
  NativeBaseProvider,
  Input,
  Center,
  FlatList,
  Actionsheet,
  Icon,
} from 'native-base';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filterNotes = useMemo(() => {
    if (searchKey === '') return notes;
    return notes.filter(note =>
      note.description.toLowerCase().includes(searchKey.toLowerCase()),
    );
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

  const onDelete = () => {
    if (selectedId) {
      dispatch(deleteNote(selectedId));
      setSelectedId(null);
    }
    setActionSheetVisible(false);
  };

  return (
    <NativeBaseProvider isSSR={false}>
      <Center style={styles.searchBar}>
        <Input
          value={searchKey}
          onChangeText={v => setSearchKey(v)}
          placeholder="搜索笔记"
          variant="filled" // 使用 filled 风格
          bg="gray.100" // 背景色
          borderRadius="xl" // 圆角
          px="4"
          py="3"
          fontSize="md"
          InputLeftElement={
            <Icon
              as={MaterialIcons}
              name="search"
              size="6"
              ml="3"
              color="gray.400"
            />
          }
          _focus={{
            bg: 'white',
            borderColor: 'primary.500',
          }}
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

      {/* 操作 ActionSheet */}
      <Actionsheet
        isOpen={actionSheetVisible}
        onClose={() => {
          setActionSheetVisible(false);
          setSelectedId(null);
        }}>
        <Actionsheet.Content>
          <Actionsheet.Item
            startIcon={<Icon as={MaterialIcons} name="edit" size="6" />}
            onPress={() => {
              setActionSheetVisible(false);
              if (selectedId)
                navigation.navigate('NoteDetail', {id: selectedId});
            }}>
            编辑
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon as={MaterialIcons} name="delete" size="6" />}
            onPress={onDelete}>
            删除
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon as={MaterialIcons} name="cancel" size="6" />}
            onPress={() => {
              setActionSheetVisible(false);
              setSelectedId(null);
            }}>
            取消
          </Actionsheet.Item>
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
