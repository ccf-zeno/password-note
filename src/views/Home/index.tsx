import {StyleSheet, Text} from 'react-native';
import {NativeBaseProvider, Input, Center, FlatList, Button} from 'native-base';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

import AddBtn from '@/components/AddBtn';
import NoteCard from '@/components/NoteCard';
import type {RootState} from '@/stores';
import {useState} from 'react';

function HomeScreen() {
  const notes = useSelector((state: RootState) => state.note.notes);
  const navigation = useNavigation();

  console.log('render');

  const onCardPress = () => {
    navigation.navigate('NoteDetail');
  };

  const onAddPress = () => {
    navigation.navigate('NoteDetail', {
      mode: 'add',
    });
  };

  return (
    <NativeBaseProvider isSSR={false}>
      <Center style={styles.searchBar}>
        <Input />
      </Center>

      <FlatList
        data={notes}
        renderItem={({item}) => (
          <NoteCard
            title={item.title}
            style={styles.card}
            onPress={onCardPress}
            key={item.id}
          />
        )}
        style={styles.cardSection}
      />

      <AddBtn style={styles.addBtn} onPress={onAddPress} />
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  cardSection: {
    paddingVertical: 24,
    paddingHorizontal: 16,
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
