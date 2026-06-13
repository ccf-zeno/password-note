import {useState, useMemo, useEffect} from 'react';
import {KeyboardAvoidingView, Modal, Pressable, StyleSheet} from 'react-native';
import {Input, Text, XStack, YStack} from 'tamagui';
import {useSelector} from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import type {RootState} from '@/stores';
import type {Note, QuickCopyItem} from '@/interface';
import {lightTap} from '@/utils/haptic';

interface Info {
  label: string;
  value: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (info: Info) => void;
  title?: string;
  initialLabel?: string;
  initialValue?: string;
  showSuggestions?: boolean;
}

const InfoEditModal = ({
  visible,
  onClose,
  onConfirm,
  title = '新增信息',
  initialLabel = '',
  initialValue = '',
  showSuggestions = true,
}: Props) => {
  const [label, setLabel] = useState(initialLabel);
  const [value, setValue] = useState(initialValue);

  const notes = useSelector((state: RootState) => state.note.notes as Note[]);
  const quickCopyList = useSelector(
    (state: RootState) => state.quickCopy.list as QuickCopyItem[],
  );

  // 打开时重置
  useEffect(() => {
    if (visible) {
      setLabel(initialLabel);
      setValue(initialValue);
    }
  }, [visible, initialLabel, initialValue]);

  // 收集所有已有信息
  const allExistingItems = useMemo(() => {
    const seen = new Set<string>();
    const items: Info[] = [];
    const add = (l: string, v: string) => {
      if (!v || seen.has(v)) return;
      seen.add(v);
      items.push({label: l, value: v});
    };
    quickCopyList.forEach(item => add(item.title, item.content));
    notes.forEach(note => {
      note.info.forEach(info => add(info.label, info.value));
    });
    return items;
  }, [quickCopyList, notes]);

  // 匹配建议
  const suggestions = useMemo(() => {
    if (!showSuggestions) return [];
    const query = value.trim().toLowerCase();
    if (!query) return [];
    return allExistingItems
      .filter(
        item =>
          item.value.toLowerCase().includes(query) &&
          item.value.toLowerCase() !== query,
      )
      .slice(0, 5);
  }, [value, allExistingItems, showSuggestions]);

  const handleConfirm = () => {
    const v = value.trim();
    if (!v) return;
    onConfirm({label: label.trim(), value: v});
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior="height">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={e => e.stopPropagation()}>
          <Text fontSize={18} fontWeight="700" color="#1e293b" marginBottom={16}>
            {title}
          </Text>

          <YStack gap={12} position="relative">
            <YStack gap={6}>
              <Text fontSize={13} color="#64748b">内容（必填）</Text>
              <Input
                value={value}
                onChangeText={setValue}
                placeholder="输入内容"
                placeholderTextColor={"#94a3b8" as any}
                backgroundColor="#f8fafc"
                borderWidth={1}
                borderColor="#e2e8f0"
                borderRadius={12}
                paddingHorizontal={14}
                paddingVertical={12}
                fontSize={15}
                color="#1e293b"
                autoFocus
              />
            </YStack>

            {/* 匹配建议 - 悬浮定位 */}
            {suggestions.length > 0 && (
              <YStack
                position="absolute"
                top={68}
                left={0}
                right={0}
                zIndex={10}
                backgroundColor="#fff"
                borderRadius={10}
                borderWidth={1}
                borderColor="#e2e8f0"
                overflow="hidden"
                shadowColor="#000"
                shadowOffset={{width: 0, height: 4}}
                shadowOpacity={0.1}
                shadowRadius={12}
                elevation={5}>
                {suggestions.map((item, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setLabel(item.label || label);
                      setValue(item.value);
                      lightTap();
                    }}
                    style={({pressed}) => [
                      styles.suggestionItem,
                      pressed && {backgroundColor: '#f1f5f9'},
                      index < suggestions.length - 1 &&
                        styles.suggestionBorder,
                    ]}>
                    <MaterialIcons
                      name="content-paste"
                      size={16}
                      color="#94a3b8"
                    />
                    <YStack flex={1} marginLeft={8}>
                      <Text fontSize={14} color="#1e293b" numberOfLines={1}>
                        {item.value}
                      </Text>
                      {item.label ? (
                        <Text
                          fontSize={12}
                          color="#94a3b8"
                          numberOfLines={1}>
                          {item.label}
                        </Text>
                      ) : null}
                    </YStack>
                  </Pressable>
                ))}
              </YStack>
            )}

            <YStack gap={6}>
              <Text fontSize={13} color="#64748b">标题（可选）</Text>
              <Input
                value={label}
                onChangeText={setLabel}
                placeholder="如：手机号、身份证、地址"
                placeholderTextColor={"#94a3b8" as any}
                backgroundColor="#f8fafc"
                borderWidth={1}
                borderColor="#e2e8f0"
                borderRadius={12}
                paddingHorizontal={14}
                paddingVertical={12}
                fontSize={15}
                color="#1e293b"
              />
            </YStack>
          </YStack>

          <XStack justifyContent="flex-end" marginTop={20} gap={10}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text fontSize={15} color="#64748b" fontWeight="500">
                取消
              </Text>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, !value.trim() && styles.confirmBtnDisabled]}
              onPress={handleConfirm}>
              <Text
                fontSize={15}
                color={value.trim() ? 'white' : '#94a3b8'}
                fontWeight="600">
                确认
              </Text>
            </Pressable>
          </XStack>
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  confirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },
  confirmBtnDisabled: {
    backgroundColor: '#e2e8f0',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
});

export default InfoEditModal;
