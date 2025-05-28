import {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {IconButton, Icon, Actionsheet, useToast} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
  exportNotes as doExport,
  importNotes as doImport,
} from '@/utils/storage';
import {setNoteList} from '@/stores/note';
import type {RootState} from '@/stores';

export default function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();
  const dispatch = useDispatch();
  const notes = useSelector((state: RootState) => state.note.notes);

  const handleExport = async () => {
    try {
      const path = await doExport(notes);
      toast.show({description: `导出成功：${path}`, placement: 'top'});
    } catch (e) {
      toast.show({description: '导出失败', placement: 'top'});
    }
  };

  const handleImport = async () => {
    try {
      const importedNotes = await doImport();
      dispatch(setNoteList(importedNotes));
      toast.show({description: '导入成功', placement: 'top'});
    } catch (e) {
      toast.show({description: '导入失败', placement: 'top'});
    }
  };

  return (
    <>
      <IconButton
        icon={<Icon as={MaterialIcons} name="more-vert" />}
        onPress={() => setIsOpen(true)}
        borderRadius="full"
        _icon={{color: 'gray.700'}}
        mr={1}
      />
      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Actionsheet.Content>
          <Actionsheet.Item
            startIcon={
              <Icon as={MaterialIcons} name="file-download" size="6" />
            }
            onPress={() => {
              setIsOpen(false);
              handleExport();
            }}>
            导出数据
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon as={MaterialIcons} name="file-upload" size="6" />}
            onPress={() => {
              setIsOpen(false);
              handleImport();
            }}>
            导入数据
          </Actionsheet.Item>
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
}
