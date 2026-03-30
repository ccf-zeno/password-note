import {Platform, Vibration} from 'react-native';

/** 轻触 - 选中/取消选中、复制 */
export const lightTap = () => Vibration.vibrate(Platform.OS === 'android' ? 20 : 10);

/** 中等 - 长按、保存成功 */
export const mediumTap = () => Vibration.vibrate(Platform.OS === 'android' ? 40 : 20);

/** 重击 - 删除确认 */
export const heavyTap = () => Vibration.vibrate(Platform.OS === 'android' ? 80 : 40);
