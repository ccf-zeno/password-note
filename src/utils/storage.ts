import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import type {Note, QuickCopyItem} from '@/interface';

interface BackupData {
  notes: Note[];
  quickCopy: QuickCopyItem[];
}

export async function exportData(notes: Note[], quickCopy: QuickCopyItem[]) {
  try {
    const data: BackupData = {notes, quickCopy};
    const path = `${RNFS.DownloadDirectoryPath}/notes-backup-${Date.now()}.json`;
    await RNFS.writeFile(path, JSON.stringify(data, null, 2), 'utf8');
    return path;
  } catch (err) {
    throw new Error('导出失败');
  }
}

export async function importData(): Promise<BackupData> {
  try {
    const res = await DocumentPicker.pickSingle({type: [DocumentPicker.types.allFiles]});
    const fileContent = await RNFS.readFile(res.uri, 'utf8');
    const parsed = JSON.parse(fileContent);
    if (Array.isArray(parsed)) {
      return {notes: parsed as Note[], quickCopy: []};
    }
    return {
      notes: parsed.notes ?? [],
      quickCopy: parsed.quickCopy ?? [],
    };
  } catch (err) {
    throw new Error('导入失败');
  }
}
