import {FlatList, StyleSheet, Modal, TouchableOpacity, StatusBar, View, Pressable} from 'react-native';
import {Text, XStack, YStack} from 'tamagui';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import AddBtn from '@/components/AddBtn';
import NoteCard from '@/components/NoteCard';
import Header, {HEADER_HEIGHT_CONTENT} from '@/components/Header';
import ShaderBackground from '@/components/ShaderBackground';
import ConfirmDialog from '@/components/ConfirmDialog';
import {lightTap, mediumTap, heavyTap} from '@/utils/haptic';
import type {RootState} from '@/stores';
import {deleteNote, batchDeleteNotes} from '@/stores/note';
import {useState, useCallback} from 'react';
import type {Note} from '@/interface';

function AllNotes() {
  const notes = useSelector((state: RootState) => state.note.notes as Note[]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const headerHeight = insets.top + HEADER_HEIGHT_CONTENT;

  // 长按菜单
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetTargetId, setSheetTargetId] = useState<string | null>(null);

  // 批量模式
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 删除确认弹窗
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'single' | 'batch'>('single');

  const isAllSelected = notes.length > 0 && selectedIds.size === notes.length;

  const enterBatchMode = useCallback(() => {
    setBatchMode(true);
    setSelectedIds(new Set());
  }, []);

  const exitBatchMode = useCallback(() => {
    setBatchMode(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelect = useCallback((id: string) => {
    lightTap();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    mediumTap();
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notes.map(n => n.id)));
    }
  }, [isAllSelected, notes]);

  // 请求批量删除确认
  const onBatchDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    setConfirmType('batch');
    setConfirmOpen(true);
  }, [selectedIds]);

  // 长按菜单 - 请求单条删除确认
  const onSheetDelete = useCallback(() => {
    if (!sheetTargetId) return;
    setSheetVisible(false);
    setConfirmType('single');
    setConfirmOpen(true);
  }, [sheetTargetId]);

  // 执行删除
  const executeDelete = useCallback(() => {
    heavyTap();
    if (confirmType === 'batch') {
      dispatch(batchDeleteNotes(Array.from(selectedIds)));
      exitBatchMode();
    } else {
      if (sheetTargetId) {
        dispatch(deleteNote(sheetTargetId));
        setSheetTargetId(null);
      }
    }
    setConfirmOpen(false);
  }, [confirmType, selectedIds, sheetTargetId, dispatch, exitBatchMode]);

  // 确认弹窗文案
  const confirmTitle = '确认删除';
  const confirmDesc =
    confirmType === 'batch'
      ? `确定要删除选中的 ${selectedIds.size} 条记录吗？此操作不可恢复。`
      : `确定要删除「${notes.find(n => n.id === sheetTargetId)?.description || '未命名'}」吗？`;

  // 长按菜单 - 编辑
  const onSheetEdit = useCallback(() => {
    setSheetVisible(false);
    if (sheetTargetId) {
      navigation.navigate('NoteDetail', {id: sheetTargetId});
    }
  }, [sheetTargetId, navigation]);

  // Header 右侧
  const headerRight = batchMode ? (
    <TouchableOpacity onPress={exitBatchMode} activeOpacity={0.7}>
      <Text style={styles.headerAction}>取消</Text>
    </TouchableOpacity>
  ) : notes.length > 0 ? (
    <TouchableOpacity onPress={enterBatchMode} activeOpacity={0.7}>
      <Text style={styles.headerAction}>管理</Text>
    </TouchableOpacity>
  ) : null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <ShaderBackground />
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <Header title="全部记录" rightAction={headerRight} />

      <FlatList
        data={notes}
        renderItem={({item}) => (
          <NoteCard
            title={item.description}
            style={styles.card}
            showCheckbox={batchMode}
            selected={selectedIds.has(item.id)}
            onPress={
              batchMode
                ? () => toggleSelect(item.id)
                : () => navigation.navigate('NoteDetail', {id: item.id})
            }
            onLongPress={
              batchMode
                ? undefined
                : () => {
                    mediumTap();
                    setSheetTargetId(item.id);
                    setSheetVisible(true);
                  }
            }
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, {paddingTop: headerHeight + 12}]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <YStack alignItems="center" paddingTop="$10">
            <YStack
              width={64}
              height={64}
              borderRadius={16}
              backgroundColor="#f1f5f9"
              alignItems="center"
              justifyContent="center"
              marginBottom="$3">
              <MaterialIcons name="lock-outline" size={30} color="#cbd5e1" />
            </YStack>
            <Text color="#64748b" fontSize={15} fontWeight="600">
              还没有保存任何信息
            </Text>
            <Text color="#94a3b8" marginTop="$1" fontSize={13}>
              点击右下角 + 开始添加
            </Text>
          </YStack>
        }
      />

      {/* 批量操作底栏 */}
      {batchMode && (
        <View style={[styles.batchBar, {paddingBottom: insets.bottom || 16}]}>
          <TouchableOpacity
            onPress={toggleSelectAll}
            activeOpacity={0.7}
            style={styles.batchBarBtn}>
            <MaterialIcons
              name={isAllSelected ? 'check-circle' : 'radio-button-unchecked'}
              size={22}
              color={isAllSelected ? '#6366f1' : '#94a3b8'}
            />
            <Text fontSize={14} color="#475569" marginLeft={6} fontWeight="500">
              {isAllSelected ? '取消全选' : '全选'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onBatchDelete}
            activeOpacity={selectedIds.size > 0 ? 0.7 : 1}
            style={[
              styles.batchDeleteBtn,
              selectedIds.size === 0 && styles.batchDeleteBtnDisabled,
            ]}>
            <MaterialIcons name="delete-outline" size={20} color="#fff" />
            <Text fontSize={14} color="white" fontWeight="600" marginLeft={4}>
              删除{selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 新增按钮（批量模式隐藏） */}
      {!batchMode && (
        <AddBtn
          style={styles.addBtn}
          onPress={() => navigation.navigate('NoteDetail', {id: 'new'})}
        />
      )}

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmTitle}
        description={confirmDesc}
        actions={[
          {label: '取消', onPress: () => setConfirmOpen(false)},
          {
            label: '删除',
            color: 'white',
            backgroundColor: '#ef4444',
            onPress: executeDelete,
          },
        ]}
      />

      {/* 长按操作菜单 */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          setSheetVisible(false);
          setSheetTargetId(null);
        }}>
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setSheetVisible(false);
            setSheetTargetId(null);
          }}>
          <Pressable onPress={e => e.stopPropagation()}>
            <YStack
              backgroundColor="white"
              borderTopLeftRadius={24}
              borderTopRightRadius={24}
              paddingTop="$5"
              paddingBottom="$6"
              paddingHorizontal="$4">
              <YStack alignItems="center" marginBottom="$4">
                <YStack
                  width={36}
                  height={4}
                  borderRadius={2}
                  backgroundColor="#e2e8f0"
                />
              </YStack>

              <TouchableOpacity style={styles.sheetItem} onPress={onSheetEdit}>
                <YStack
                  width={40}
                  height={40}
                  borderRadius={12}
                  backgroundColor="#eef2ff"
                  alignItems="center"
                  justifyContent="center">
                  <MaterialIcons name="edit" size={20} color="#6366f1" />
                </YStack>
                <Text fontSize={16} fontWeight="500" marginLeft="$3" color="#1e293b">
                  编辑
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetItem} onPress={onSheetDelete}>
                <YStack
                  width={40}
                  height={40}
                  borderRadius={12}
                  backgroundColor="#fef2f2"
                  alignItems="center"
                  justifyContent="center">
                  <MaterialIcons name="delete" size={20} color="#ef4444" />
                </YStack>
                <Text fontSize={16} fontWeight="500" marginLeft="$3" color="#ef4444">
                  删除
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setSheetVisible(false);
                  setSheetTargetId(null);
                }}>
                <Text fontSize={15} fontWeight="600" color="#64748b">
                  取消
                </Text>
              </TouchableOpacity>
            </YStack>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerAction: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6366f1',
    includeFontPadding: false,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 10,
  },
  addBtn: {
    position: 'absolute',
    bottom: 32,
    right: 24,
  },
  batchBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
  },
  batchBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  batchDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  batchDeleteBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'flex-end',
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  cancelBtn: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
});

export default AllNotes;
