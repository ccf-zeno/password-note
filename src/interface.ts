export interface Note {
  id: string;
  description: string;
  info: NoteInfo[];
}

interface NoteInfo {
  label: string;
  value: string;
}
