import {StyleSheet} from 'react-native';
import {
  NativeBaseProvider,
  Input,
  Center,
  FlatList,
  Actionsheet,
  Box,
  Text,
  Icon,
} from 'native-base';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {MaterialIcons, Ionicons} from '@expo/vector-icons';

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
  const [deleteConfirm, setDeleteConfirm] = useState<boolean>(false);
  const [searchKey, setSearchKey] = useState<string>('');
  const notes = useSelector((state: RootState) => state.note.notes as Note[]);
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const filterNotes = useMemo(() => {
    if (searchKey === '') {
      return notes;
    }

    const list: Note[] = [];

    notes.forEach(note => {
      if (note.description.includes(searchKey)) {
        list.push(note);
      }
    });

    return list;
  }, [searchKey, notes]);

  const onCardPress = (id: string) => {
    navigation.navigate('NoteDetail', {
      id,
    });
  };

  const onAddPress = () => {
    const id = generateId();

    dispatch(
      addNote({
        id,
        description: '',
        info: [],
      }),
    );

    setTimeout(() => {
      navigation.navigate('NoteDetail', {
        id,
      });
    });
  };

  const onDeletePress = (id: string) => {
    setDeleteConfirm(true);

    // dispatch(deleteNote(id));
  };

  const onCloseConfirm = () => {
    setDeleteConfirm(false);
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
            key={item.id}
            onDeletePress={() => onDeletePress(item.id)}
          />
        )}
        style={styles.cardSection}
      />

      <AddBtn style={styles.addBtn} onPress={onAddPress} />

      <Actionsheet
        isOpen={deleteConfirm}
        onClose={onCloseConfirm}
        hideDragIndicator>
        <Actionsheet.Content>
          <Box w="100%" h={60} px={4} justifyContent="center">
            <Text
              fontSize="16"
              color="gray.500"
              _dark={{
                color: 'gray.300',
              }}>
              Albums
            </Text>
          </Box>
          <Actionsheet.Item
            startIcon={<Icon as={MaterialIcons} size="6" name="delete" />}>
            Delete
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon as={MaterialIcons} name="share" size="6" />}>
            Share
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon as={Ionicons} name="play-circle" size="6" />}>
            Play
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon as={MaterialIcons} size="6" name="favorite" />}>
            Favourite
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={
              <Icon viewBox="0 0 24 24" size="6" fill="none">
                <Path d="M12.0007 10.5862L16.9507 5.63623L18.3647 7.05023L13.4147 12.0002L18.3647 16.9502L16.9507 18.3642L12.0007 13.4142L7.05072 18.3642L5.63672 16.9502L10.5867 12.0002L5.63672 7.05023L7.05072 5.63623L12.0007 10.5862Z" />
              </Icon>
            }>
            Cancel
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
