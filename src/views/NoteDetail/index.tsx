import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Pressable,
  View,
  StatusBar,
  Text as RNText,
  ToastAndroid,
  Platform,
  BackHandler,
} from 'react-native';
import { Input, Text, XStack, YStack } from 'tamagui';
import Clipboard from '@react-native-clipboard/clipboard';
import { useSelector, useDispatch } from 'react-redux';
import {
  useRoute,
  useNavigation,
  useIsFocused,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import type { RootState } from '@/stores';
import { updateNote, addNote } from '@/stores/note';
import type { Note } from '@/interface';
import ShaderBackground from '@/components/ShaderBackground';
import Header, { HEADER_HEIGHT_CONTENT } from '@/components/Header';
import ConfirmDialog from '@/components/ConfirmDialog';
import InfoEditModal from '@/components/InfoEditModal';
import { lightTap, mediumTap } from '@/utils/haptic';

interface Info {
  label: string;
  value: string;
}

const NoteDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const notes = useSelector((state: RootState) => state.note.notes as Note[]);
  const routeId = route.params?.id as string;
  const isNew = routeId === 'new';

  const existingNote = useMemo(
    () => (isNew ? undefined : notes.find(n => n.id === routeId)),
    [notes, routeId, isNew],
  );

  // 本地编辑状态
  const [desc, setDesc] = useState(existingNote?.description ?? '');
  const [infoList, setInfoList] = useState<Info[]>(existingNote?.info ?? []);
  const [isEditing, setIsEditing] = useState(isNew);
  const [modalVisible, setModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editInfo, setEditInfo] = useState<Info>({ label: '', value: '' });

  // 未保存提醒
  const [unsavedOpen, setUnsavedOpen] = useState(false);

  const headerHeight = insets.top + HEADER_HEIGHT_CONTENT;
  const canSave = desc.trim().length > 0 || infoList.length > 0;

  // 判断是否有未保存的改动
  const hasUnsavedChanges = useCallback(() => {
    if (!isEditing) return false;
    if (isNew) {
      return desc.trim().length > 0 || infoList.length > 0;
    }
    // 编辑已有笔记：对比原始数据
    const origDesc = existingNote?.description ?? '';
    const origInfo = existingNote?.info ?? [];
    if (desc !== origDesc) return true;
    if (infoList.length !== origInfo.length) return true;
    return infoList.some(
      (item, i) =>
        item.label !== origInfo[i].label || item.value !== origInfo[i].value,
    );
  }, [isEditing, isNew, desc, infoList, existingNote]);

  // 尝试返回
  const tryGoBack = useCallback(() => {
    if (hasUnsavedChanges()) {
      setUnsavedOpen(true);
    } else {
      navigation.goBack();
    }
  }, [hasUnsavedChanges, navigation]);

  // 不保存直接返回
  const discardAndGoBack = useCallback(() => {
    setUnsavedOpen(false);
    navigation.goBack();
  }, [navigation]);

  // 保存并返回
  const saveAndGoBack = useCallback(() => {
    setUnsavedOpen(false);
    if (isNew) {
      const newId = generateId();
      dispatch(addNote({ id: newId, description: desc, info: infoList }));
    } else {
      dispatch(updateNote({ id: routeId, description: desc, info: infoList }));
    }
    navigation.goBack();
  }, [isNew, desc, infoList, routeId, dispatch, navigation]);

  // Android 系统返回键拦截
  useEffect(() => {
    if (!isFocused) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (hasUnsavedChanges()) {
        setUnsavedOpen(true);
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [isFocused, hasUnsavedChanges]);

  // 保存
  const onSave = () => {
    mediumTap();
    if (isNew) {
      const newId = generateId();
      dispatch(addNote({ id: newId, description: desc, info: infoList }));
      navigation.goBack();
    } else {
      dispatch(updateNote({ id: routeId, description: desc, info: infoList }));
      setIsEditing(false);
    }
  };

  const onCopyPress = (text: string) => {
    Clipboard.setString(text);
    lightTap();
    ToastAndroid.show('已复制', ToastAndroid.SHORT);
  };

  const onEditInfoPress = (index: number) => {
    setEditIndex(index);
    setEditInfo(infoList[index]);
    setModalVisible(true);
  };

  const onDeleteInfoPress = (index: number) => {
    lightTap();
    const newInfo = [...infoList];
    newInfo.splice(index, 1);
    setInfoList(newInfo);
  };

  const onAddInfoPress = () => {
    setEditInfo({ label: '', value: '' });
    setEditIndex(null);
    setModalVisible(true);
  };

  // Header 右侧按钮
  const headerRight = isEditing ? (
    <TouchableOpacity
      onPress={onSave}
      disabled={!canSave}
      activeOpacity={canSave ? 0.7 : 1}
    >
      <RNText
        style={[styles.headerAction, !canSave && styles.headerActionDisabled]}
      >
        保存
      </RNText>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity onPress={() => setIsEditing(true)} activeOpacity={0.7}>
      <RNText style={styles.headerAction}>编辑</RNText>
    </TouchableOpacity>
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <ShaderBackground />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <Header
        title={isNew ? '新增笔记' : desc.trim() || '笔记详情'}
        rightAction={headerRight}
        onBack={tryGoBack}
      />

      <ScrollView
        style={styles.page}
        contentContainerStyle={{
          paddingTop: headerHeight + 16,
          paddingBottom: isEditing ? 100 : 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 描述 */}
        <View style={styles.card}>
          <Text fontSize={13} color="#64748b" marginBottom={8} fontWeight="600">
            描述
          </Text>
          {isEditing ? (
            <Input
              placeholder="请输入笔记描述（如：招商银行）"
              value={desc}
              onChangeText={setDesc}
              backgroundColor="#f8fafc"
              borderWidth={0}
              borderRadius={8}
              fontSize={15}
              paddingHorizontal="$3"
              color="#1e293b"
            />
          ) : (
            <Text
              fontSize={15}
              color="#1e293b"
              paddingHorizontal="$3"
              paddingVertical="$2"
            >
              {desc || '暂无描述'}
            </Text>
          )}
        </View>

        {/* 信息列表 */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          marginTop={16}
          marginBottom={12}
          paddingHorizontal={4}
        >
          <Text fontSize={13} fontWeight="600" color="#64748b">
            全部信息
          </Text>
          <Text fontSize={12} color="#94a3b8">
            {infoList.length} 项
          </Text>
        </XStack>

        {infoList.length === 0 ? (
          <View style={styles.card}>
            <YStack alignItems="center" paddingVertical={20}>
              <MaterialIcons
                name="add-circle-outline"
                size={36}
                color="#cbd5e1"
              />
              <Text color="#94a3b8" marginTop={8} fontSize={14}>
                {isEditing ? '暂无信息，点击下方按钮添加' : '暂无信息'}
              </Text>
            </YStack>
          </View>
        ) : (
          <YStack gap={6} marginBottom={12}>
            {infoList.map((info, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={
                  isEditing
                    ? () => onEditInfoPress(index)
                    : () => onCopyPress(info.value)
                }
              >
                <XStack alignItems="center" justifyContent="space-between">
                  <YStack flex={1} marginRight={8}>
                    <Text
                      fontSize={15}
                      fontWeight="500"
                      color="#1e293b"
                      numberOfLines={2}
                    >
                      {info.value}
                    </Text>
                    {info.label ? (
                      <Text fontSize={12} color="#94a3b8" marginTop={4}>
                        {info.label}
                      </Text>
                    ) : null}
                  </YStack>

                  {isEditing && (
                    <Pressable
                      onPress={() => onDeleteInfoPress(index)}
                      style={({ pressed }) => [
                        styles.deleteBtn,
                        pressed && styles.btnPressed,
                      ]}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={15}
                        color="#ef4444"
                      />
                    </Pressable>
                  )}
                </XStack>
              </Pressable>
            ))}
          </YStack>
        )}
      </ScrollView>

      {/* 悬浮新增信息按钮 */}
      {isEditing && (
        <View
          style={[styles.addInfoBar, { paddingBottom: insets.bottom || 16 }]}
        >
          <TouchableOpacity
            onPress={onAddInfoPress}
            style={styles.addInfoBtn}
            activeOpacity={0.8}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text fontSize={15} color="white" fontWeight="600" marginLeft={6}>
              新增信息
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 编辑/新增弹窗 */}
      <InfoEditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={info => {
          const newInfo = [...infoList];
          if (editIndex === null) {
            newInfo.push(info);
          } else {
            newInfo[editIndex] = info;
          }
          setInfoList(newInfo);
          setModalVisible(false);
          setEditIndex(null);
        }}
        title={editIndex === null ? '新增信息' : '编辑信息'}
        initialLabel={editInfo.label}
        initialValue={editInfo.value}
      />

      {/* 未保存提醒 */}
      <ConfirmDialog
        open={unsavedOpen}
        onClose={() => setUnsavedOpen(false)}
        title="未保存的更改"
        description="当前有未保存的编辑内容，是否保存？"
        actions={[
          { label: '不保存', onPress: discardAndGoBack },
          {
            label: '保存',
            color: 'white',
            backgroundColor: '#6366f1',
            onPress: saveAndGoBack,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerAction: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6366f1',
    includeFontPadding: false,
  },
  headerActionDisabled: {
    color: '#cbd5e1',
  },
  page: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 16,
  },
  cardPressed: {
    backgroundColor: '#f8fafc',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  btnPressed: {
    opacity: 0.7,
  },
  addInfoBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  addInfoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
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
