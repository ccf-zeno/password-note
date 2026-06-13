import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Pressable,
  Dimensions,
  View,
  BackHandler,
  Keyboard,
} from 'react-native';
import {Input, Text, XStack, YStack} from 'tamagui';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation, useIsFocused} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

import ShaderBackground from '@/components/ShaderBackground';
import NoteCard from '@/components/NoteCard';
import QuickCopyList from '@/components/QuickCopyList';
import type {RootState} from '@/stores';
import {setNoteList, deleteNote} from '@/stores/note';
import {setQuickCopyList} from '@/stores/quickCopy';
import {exportData, importData} from '@/utils/storage';
import {mediumTap} from '@/utils/haptic';
import {useMemo, useState, useCallback, useEffect, useRef} from 'react';
import type {Note, QuickCopyItem} from '@/interface';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.7;
const TIMING_CONFIG = {duration: 280, easing: Easing.bezier(0.25, 0.1, 0.25, 1)};

const SEARCH_BAR_H = 64;
const SEARCH_BAR_RADIUS = 16;
const SEARCH_BAR_MX = 20;
const SEARCH_ANIM_CONFIG = {
  duration: 320,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
};

function HomeScreen() {
  const [searchKey, setSearchKey] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const progress = useSharedValue(0);
  const searchProgress = useSharedValue(0);
  const notes = useSelector((state: RootState) => state.note.notes as Note[]);
  const quickCopyList = useSelector((state: RootState) => state.quickCopy.list as QuickCopyItem[]);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<any>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSearching = searchKey.trim().length > 0;
  const isActive = isSearchMode;

  const activeTop = insets.top + 12;

  const enterSearch = useCallback(() => {
    if (isModalOpen) return;
    setIsSearchMode(true);
  }, [isModalOpen]);

  const exitSearch = useCallback(() => {
    setSearchKey('');
    setIsSearchMode(false);
    inputRef.current?.blur();
  }, []);

  useEffect(() => {
    if (!isActive || !isFocused) return;
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      exitSearch();
      return true;
    });
    return () => handler.remove();
  }, [isActive, isFocused, exitSearch]);

  useEffect(() => {
    searchProgress.value = withTiming(isActive ? 1 : 0, SEARCH_ANIM_CONFIG);
  }, [isActive, searchProgress]);

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const key = searchKey.toLowerCase();
    return notes.filter(
      note =>
        note.description.toLowerCase().includes(key) ||
        note.info.some(
          i =>
            i.label.toLowerCase().includes(key) ||
            i.value.toLowerCase().includes(key),
        ),
    );
  }, [searchKey, notes, isSearching]);

  // ─── 设置按钮淡出 ───
  const settingsBtnAnimStyle = useAnimatedStyle(() => {
    'worklet';
    const p = searchProgress.value;
    return {
      opacity: interpolate(p, [0, 0.3], [1, 0], Extrapolation.CLAMP),
      transform: [
        {scale: interpolate(p, [0, 0.3], [1, 0.8], Extrapolation.CLAMP)},
      ],
    };
  });

  // ─── 返回按钮淡入 ───
  const backBtnAnimStyle = useAnimatedStyle(() => {
    'worklet';
    const p = searchProgress.value;
    return {
      opacity: interpolate(p, [0.4, 0.8], [0, 1], Extrapolation.CLAMP),
      transform: [
        {translateX: interpolate(p, [0.4, 0.8], [-12, 0], Extrapolation.CLAMP)},
      ],
    };
  });

  // ─── 搜索结果淡入 ───
  const resultAnimStyle = useAnimatedStyle(() => {
    'worklet';
    const p = searchProgress.value;
    return {
      opacity: interpolate(p, [0.3, 0.8], [0, 1], Extrapolation.CLAMP),
      transform: [
        {translateY: interpolate(p, [0.3, 0.8], [30, 0], Extrapolation.CLAMP)},
      ],
    };
  });

  // ─── 抽屉 ───
  const openDrawer = useCallback(() => {
    setDrawerVisible(true);
    progress.value = withTiming(1, TIMING_CONFIG);
  }, [progress]);

  const hideDrawer = useCallback(() => {
    setDrawerVisible(false);
  }, []);

  const closeDrawer = useCallback(() => {
    progress.value = withTiming(0, TIMING_CONFIG, () => {
      runOnJS(hideDrawer)();
    });
  }, [progress, hideDrawer]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{translateX: interpolate(progress.value, [0, 1], [DRAWER_WIDTH, 0])}],
  }));

  const handleExport = useCallback(async () => {
    closeDrawer();
    try {
      const path = await exportData(notes, quickCopyList);
      Alert.alert('', `导出成功：${path}`);
    } catch {
      Alert.alert('', '导出失败');
    }
  }, [notes, quickCopyList, closeDrawer]);

  const handleImport = useCallback(async () => {
    closeDrawer();
    try {
      const imported = await importData();
      dispatch(setNoteList(imported.notes));
      dispatch(setQuickCopyList(imported.quickCopy));
      Alert.alert('', '导入成功');
    } catch {
      Alert.alert('', '导入失败');
    }
  }, [dispatch, closeDrawer]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <ShaderBackground />
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* 右上角设置按钮 */}
      <ReAnimated.View
        style={[styles.settingsBtn, {top: insets.top + 12}, settingsBtnAnimStyle]}
        pointerEvents={isActive ? 'none' : 'auto'}>
        <TouchableOpacity
          onPress={openDrawer}
          activeOpacity={0.7}
          style={styles.settingsBtnInner}>
          <MaterialIcons name="settings" size={24} color="#64748b" />
        </TouchableOpacity>
      </ReAnimated.View>

      {/* 返回按钮 */}
      <ReAnimated.View
        style={[
          styles.backBtn,
          {top: activeTop + (48 - 40) / 2},
          backBtnAnimStyle,
        ]}
        pointerEvents={isActive ? 'auto' : 'none'}>
        <TouchableOpacity onPress={exitSearch} activeOpacity={0.7} style={styles.backBtnInner}>
          <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
      </ReAnimated.View>

      {/* ─── 非搜索态：居中布局 ─── */}
      {!isActive && (
        <ScrollView
          style={StyleSheet.absoluteFill}
          contentContainerStyle={styles.centerContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          {/* 搜索框 */}
          <View style={styles.searchBarRest}>
            <MaterialIcons name="search" size={22} color="#94a3b8" />
            <Input
              ref={inputRef}
              flex={1}
              value={searchKey}
              onChangeText={setSearchKey}
              onFocus={enterSearch}
              onBlur={() => {}}
              placeholder="搜索账号、密码..."
              placeholderTextColor="#94a3b8"
              backgroundColor="transparent"
              borderWidth={0}
              fontSize={16}
              color="#1e293b"
              marginLeft="$2"
              height="100%"
            />
          </View>

          {/* 快捷入口 */}
          <XStack gap={12} marginTop={20} paddingHorizontal={SEARCH_BAR_MX}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => navigation.navigate('AllNotes')}>
              <MaterialIcons name="list" size={24} color="#6366f1" />
              <Text fontSize={15} fontWeight="500" color="#475569" marginTop={6}>
                全部记录
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => navigation.navigate('NoteDetail', {id: 'new'})}>
              <MaterialIcons name="add" size={24} color="#6366f1" />
              <Text fontSize={15} fontWeight="500" color="#475569" marginTop={6}>
                新增
              </Text>
            </TouchableOpacity>
          </XStack>

          {/* 快捷复制 */}
          <View style={styles.quickCopyContainer}>
            <QuickCopyList onModalOpenChange={setIsModalOpen} />
          </View>
        </ScrollView>
      )}

      {/* ─── 搜索态：顶部搜索框 + 结果列表 ─── */}
      {isActive && (
        <View style={[StyleSheet.absoluteFill, {top: activeTop}]}>
          {/* 搜索框 */}
          <View style={styles.searchBarActive}>
            <View style={{width: 40}} />
            <Input
              flex={1}
              value={searchKey}
              onChangeText={setSearchKey}
              placeholder="搜索账号、密码..."
              placeholderTextColor="#94a3b8"
              backgroundColor="transparent"
              borderWidth={0}
              fontSize={16}
              color="#1e293b"
              height="100%"
              autoFocus
            />
            <View style={{width: 40}} />
          </View>

          {/* 搜索结果 */}
          <ReAnimated.View style={[{flex: 1}, resultAnimStyle]}>
            <XStack paddingHorizontal="$4" marginTop={12} marginBottom="$2">
              <Text fontSize={13} color="#94a3b8">
                找到 {searchResults.length} 条结果
              </Text>
            </XStack>

            <FlatList
              data={searchResults}
              renderItem={({item}) => (
                <NoteCard
                  title={item.description}
                  style={styles.card}
                  onPress={() => {
                    Keyboard.dismiss();
                    navigation.navigate('NoteDetail', {id: item.id});
                  }}
                  onLongPress={() => {
                    mediumTap();
                    Alert.alert('删除', `确认删除「${item.description || '未命名'}」？`, [
                      {text: '取消', style: 'cancel'},
                      {text: '删除', style: 'destructive', onPress: () => dispatch(deleteNote(item.id))},
                    ]);
                  }}
                />
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
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
                    <MaterialIcons name="search-off" size={30} color="#cbd5e1" />
                  </YStack>
                  <Text color="#64748b" fontSize={15} fontWeight="600">
                    没有匹配的结果
                  </Text>
                  <Text color="#94a3b8" marginTop="$1" fontSize={13}>
                    试试其他关键词
                  </Text>
                </YStack>
              }
            />
          </ReAnimated.View>
        </View>
      )}

      {/* 设置抽屉 */}
      {drawerVisible && (
        <>
          <ReAnimated.View style={[styles.overlay, overlayStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
          </ReAnimated.View>
          <ReAnimated.View
            style={[
              styles.drawer,
              {width: DRAWER_WIDTH, paddingTop: insets.top + 20},
              drawerStyle,
            ]}>
            <XStack paddingHorizontal="$5" marginBottom="$5">
              <Text fontSize={20} fontWeight="700" color="#0f172a">
                设置
              </Text>
            </XStack>

            <TouchableOpacity style={styles.menuItem} onPress={handleImport}>
              <MaterialIcons name="file-upload" size={22} color="#6366f1" />
              <YStack marginLeft={14} flex={1}>
                <Text fontSize={16} fontWeight="500" color="#1e293b">
                  导入数据
                </Text>
                <Text fontSize={12} color="#94a3b8" marginTop={2}>
                  从 JSON 文件导入
                </Text>
              </YStack>
              <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleExport}>
              <MaterialIcons name="file-download" size={22} color="#6366f1" />
              <YStack marginLeft={14} flex={1}>
                <Text fontSize={16} fontWeight="500" color="#1e293b">
                  导出数据
                </Text>
                <Text fontSize={12} color="#94a3b8" marginTop={2}>
                  备份到本地文件
                </Text>
              </YStack>
              <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          </ReAnimated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: SCREEN_HEIGHT * 0.3,
    paddingBottom: 40,
  },
  searchBarRest: {
    height: SEARCH_BAR_H,
    marginHorizontal: SEARCH_BAR_MX,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: SEARCH_BAR_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  searchBarActive: {
    height: 48,
    marginHorizontal: 52,
    marginRight: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 8,
    zIndex: 25,
    width: 40,
    height: 40,
  },
  backBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtn: {
    position: 'absolute',
    right: 20,
    zIndex: 30,
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  settingsBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 20,
    borderRadius: 16,
  },
  quickCopyContainer: {
    marginTop: 20,
    paddingHorizontal: SEARCH_BAR_MX,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 100,
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#f8fafc',
    zIndex: 101,
    shadowColor: '#000',
    shadowOffset: {width: -4, height: 0},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#0f172a',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
});

export default HomeScreen;
