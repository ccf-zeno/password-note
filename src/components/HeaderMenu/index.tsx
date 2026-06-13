import {useState} from 'react';
import {Pressable, StyleSheet, Modal} from 'react-native';
import {Text, YStack} from 'tamagui';
import {useSelector, useDispatch} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {
  exportData,
  importData,
} from '@/utils/storage';
import {setNoteList} from '@/stores/note';
import {setQuickCopyList} from '@/stores/quickCopy';
import type {RootState} from '@/stores';
import type {Note, QuickCopyItem} from '@/interface';
import {Alert} from 'react-native';

export default function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const notes = useSelector((state: RootState) => state.note.notes as Note[]);
  const quickCopyList = useSelector((state: RootState) => state.quickCopy.list as QuickCopyItem[]);

  const showToast = (msg: string) => {
    Alert.alert('', msg);
  };

  const handleExport = async () => {
    try {
      const path = await exportData(notes, quickCopyList);
      showToast(`导出成功：${path}`);
    } catch (e) {
      showToast('导出失败');
    }
  };

  const handleImport = async () => {
    try {
      const imported = await importData();
      dispatch(setNoteList(imported.notes));
      dispatch(setQuickCopyList(imported.quickCopy));
      showToast('导入成功');
    } catch (e) {
      showToast('导入失败');
    }
  };

  return (
    <>
      <Pressable onPress={() => setIsOpen(true)} style={styles.menuBtn}>
        <MaterialIcons name="more-vert" size={24} color="#374151" />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsOpen(false)}>
        <Pressable
          style={styles.overlay}
          onPress={() => setIsOpen(false)}>
          <Pressable onPress={e => e.stopPropagation()}>
          <YStack
            backgroundColor="white"
            borderTopLeftRadius={24}
            borderTopRightRadius={24}
            padding="$4"
            paddingBottom="$6"
            gap="$1">
            <Pressable
              style={styles.sheetItem}
              onPress={() => {
                setIsOpen(false);
                handleExport();
              }}>
              <MaterialIcons name="file-download" size={22} color="#3b82f6" />
              <Text fontSize={16} marginLeft="$3">导出数据</Text>
            </Pressable>
            <Pressable
              style={styles.sheetItem}
              onPress={() => {
                setIsOpen(false);
                handleImport();
              }}>
              <MaterialIcons name="file-upload" size={22} color="#3b82f6" />
              <Text fontSize={16} marginLeft="$3">导入数据</Text>
            </Pressable>
            <Pressable
              style={styles.sheetItem}
              onPress={() => setIsOpen(false)}>
              <MaterialIcons name="close" size={22} color="#9ca3af" />
              <Text fontSize={16} marginLeft="$3" color="$gray10">取消</Text>
            </Pressable>
          </YStack>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuBtn: {
    padding: 8,
    marginRight: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
});
