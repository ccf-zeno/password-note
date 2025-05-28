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
          placeholder="输入关键词进行搜索"
          bg="white" // 和卡片同背景
          borderRadius={6} // 圆角6，跟卡片一样
          py={3} // paddingVertical 12 左右（卡片padding 12）
          px={4} // paddingHorizontal 16
          fontSize="14"
          shadow={1} // native-base 的阴影，和卡片保持一致
          InputLeftElement={
            <Icon
              as={MaterialIcons}
              name="search"
              size={5}
              ml={3}
              color="gray.400"
            />
          }
          _focus={{
            borderColor: 'primary.500',
            borderWidth: 1,
            bg: 'white',
          }}
          w="100%"
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
    marginBottom: 8,
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
