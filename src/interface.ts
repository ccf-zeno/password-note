export interface Note {
  id: string;
  description: string;
  info: NoteInfo[];
}

interface NoteInfo {
  label: string;
  value: string;
}

export interface QuickCopyItem {
  id: string;
  title: string;    // 显示名称，如"手机号"、"身份证"
  content: string;  // 实际复制的内容
}
