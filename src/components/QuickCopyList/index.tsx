import {useState, useCallback, useEffect, useMemo} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';
import {Text, XStack, YStack} from 'tamagui';
import {useSelector, useDispatch} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Clipboard from '@react-native-clipboard/clipboard';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Gesture} from 'react-native-gesture-handler';
import {runOnJS} from 'react-native-reanimated';
import ReorderableList, {
  reorderItems,
  useReorderableDrag,
  useIsActive,
} from 'react-native-reorderable-list';

import type {RootState} from '@/stores';
import {
  addQuickCopy,
  updateQuickCopy,
  deleteQuickCopy,
  reorderQuickCopy,
} from '@/stores/quickCopy';
import type {QuickCopyItem} from '@/interface';
import ConfirmDialog from '@/components/ConfirmDialog';
import InfoEditModal from '@/components/InfoEditModal';
import {lightTap, mediumTap} from '@/utils/haptic';

const generateId = () => Math.random().toString(36).substring(2, 12);

function QuickCopyItem({
  item,
  onCopy,
  onLongPress,
}: {
  item: QuickCopyItem;
  onCopy: (item: QuickCopyItem) => void;
  onLongPress: (item: QuickCopyItem) => void;
}) {
  const drag = useReorderableDrag();
  const isActive = useIsActive();

  return (
    <Pressable
      style={[styles.item, isActive && styles.itemActive]}
      onPress={() => onCopy(item)}
      onLongPress={() => onLongPress(item)}
      delayLongPress={300}>
      <XStack alignItems="center" justifyContent="space-between">
        <YStack flex={1} marginRight={8}>
          <Text fontSize={15} fontWeight="500" color="#1e293b" numberOfLines={2}>
            {item.content}
          </Text>
          {item.title ? (
            <Text fontSize={12} color="#94a3b8" marginTop={4}>
              {item.title}
            </Text>
          ) : null}
        </YStack>
        <TouchableOpacity onPressIn={drag} hitSlop={10}>
          <MaterialIcons name="drag-handle" size={20} color={isActive ? '#6366f1' : '#cbd5e1'} />
        </TouchableOpacity>
      </XStack>
    </Pressable>
  );
}

interface Props {
  onModalOpenChange?: (open: boolean) => void;
}

const QuickCopyList = ({onModalOpenChange}: Props) => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const quickCopyList = useSelector(
    (state: RootState) => state.quickCopy.list as QuickCopyItem[],
  );

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<QuickCopyItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const panGesture = useMemo(
    () => Gesture.Pan().activateAfterLongPress(300).onStart(() => runOnJS(mediumTap)()),
    [],
  );

  const handleCopy = useCallback(
    (item: QuickCopyItem) => {
      Clipboard.setString(item.content);
      lightTap();
      ToastAndroid.show('已复制', ToastAndroid.SHORT);
    },
    [],
  );

  const handleLongPress = useCallback((item: QuickCopyItem) => {
    mediumTap();
    setSelectedItem(item);
    setMenuVisible(true);
  }, []);

  const handleAdd = useCallback(() => {
    setIsEditing(false);
    setSelectedItem(null);
    setEditModalVisible(true);
    onModalOpenChange?.(true);
  }, [onModalOpenChange]);

  const handleEdit = useCallback(() => {
    if (!selectedItem) return;
    setIsEditing(true);
    setMenuVisible(false);
    setEditModalVisible(true);
    onModalOpenChange?.(true);
  }, [selectedItem, onModalOpenChange]);

  const handleDeleteConfirm = useCallback(() => {
    setMenuVisible(false);
    setDeleteDialogVisible(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedItem) return;
    dispatch(deleteQuickCopy(selectedItem.id));
    setDeleteDialogVisible(false);
    setSelectedItem(null);
  }, [selectedItem, dispatch]);

  const handleConfirm = useCallback(
    (info: {label: string; value: string}) => {
      if (isEditing && selectedItem) {
        dispatch(
          updateQuickCopy({
            id: selectedItem.id,
            title: info.label,
            content: info.value,
          }),
        );
      } else {
        dispatch(
          addQuickCopy({
            id: generateId(),
            title: info.label,
            content: info.value,
          }),
        );
      }
      setEditModalVisible(false);
    },
    [isEditing, selectedItem, dispatch],
  );

  const handleReorder = useCallback(
    ({from, to}: {from: number; to: number}) => {
      dispatch(reorderQuickCopy(reorderItems(quickCopyList, from, to)));
    },
    [dispatch, quickCopyList],
  );

  useEffect(() => {
    const anyOpen = editModalVisible || menuVisible || deleteDialogVisible;
    onModalOpenChange?.(anyOpen);
  }, [editModalVisible, menuVisible, deleteDialogVisible, onModalOpenChange]);

  return (
    <YStack>
      {/* 标题 */}
      <XStack alignItems="center" marginBottom={12} paddingHorizontal={4}>
        <MaterialIcons name="flash-on" size={18} color="#6366f1" />
        <Text fontSize={15} fontWeight="600" color="#475569" marginLeft={6}>
          快捷复制
        </Text>
      </XStack>

      {/* 列表 */}
      {quickCopyList.length > 0 && (
        <ReorderableList
          data={quickCopyList}
          onReorder={handleReorder}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          panGesture={panGesture}
          shouldUpdateActiveItem
          cellAnimations={{transform: [{scale: 1}], opacity: 1}}
          renderItem={({item}) => (
            <QuickCopyItem
              item={item}
              onCopy={handleCopy}
              onLongPress={handleLongPress}
            />
          )}
        />
      )}

      {/* 新增按钮 */}
      <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.7}>
        <MaterialIcons name="add" size={20} color="#6366f1" />
        <Text fontSize={14} fontWeight="500" color="#6366f1" marginLeft={6}>
          添加快捷复制
        </Text>
      </TouchableOpacity>

      {/* 长按菜单 */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.menuContainer} onPress={e => e.stopPropagation()}>
            <YStack gap={0}>
              <XStack justifyContent="center" paddingTop={12} paddingBottom={8}>
                <YStack width={36} height={4} borderRadius={2} backgroundColor="#e2e8f0" />
              </XStack>
              <XStack paddingHorizontal={20} paddingBottom={16}>
                <Text fontSize={16} fontWeight="600" color="#1e293b">
                  {selectedItem?.title || '快捷复制'}
                </Text>
              </XStack>
              <TouchableOpacity style={styles.menuItem} onPress={handleEdit} activeOpacity={0.7}>
                <MaterialIcons name="edit" size={22} color="#6366f1" />
                <Text fontSize={16} fontWeight="500" color="#1e293b" marginLeft={14}>
                  编辑
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleDeleteConfirm} activeOpacity={0.7}>
                <MaterialIcons name="delete" size={22} color="#ef4444" />
                <Text fontSize={16} fontWeight="500" color="#ef4444" marginLeft={14}>
                  删除
                </Text>
              </TouchableOpacity>
              <YStack height={insets.bottom} />
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>

      {/* 删除确认 */}
      <ConfirmDialog
        open={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        title="删除快捷复制"
        description={`确认删除「${selectedItem?.title || '快捷复制'}」？`}
        actions={[
          {label: '取消', onPress: () => setDeleteDialogVisible(false)},
          {label: '删除', color: '#ef4444', onPress: handleDelete},
        ]}
      />

      {/* 共用弹窗 */}
      <InfoEditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onConfirm={handleConfirm}
        title={isEditing ? '编辑快捷复制' : '新增快捷复制'}
        initialLabel={isEditing ? selectedItem?.title || '' : ''}
        initialValue={isEditing ? selectedItem?.content || '' : ''}
      />
    </YStack>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  itemActive: {
    backgroundColor: '#eef2ff',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 10,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderStyle: 'dashed',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
});

export default QuickCopyList;
