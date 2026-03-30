import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import type {Note} from '@/interface';

/**
 * 导出数据到 JSON 文件
 */
export async function exportNotes(notes: Note[]) {
  try {
    const path = `${RNFS.DocumentDirectoryPath}/notes-backup-${Date.now()}.json`;
    await RNFS.writeFile(path, JSON.stringify(notes, null, 2), 'utf8');
    return path;
  } catch (err) {
    throw new Error('导出失败');
  }
}

/**
 * 从文件中导入数据
 */
export async function importNotes(): Promise<Note[]> {
  try {
    const res = await DocumentPicker.pickSingle({type: [DocumentPicker.types.allFiles]});
    const fileContent = await RNFS.readFile(res.uri, 'utf8');
    return JSON.parse(fileContent) as Note[];
  } catch (err) {
    throw new Error('导入失败');
  }
}
