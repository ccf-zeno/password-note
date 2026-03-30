// components/HeaderMenu.tsx
import {useState} from 'react';
import {IconButton, Icon, Actionsheet} from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useToast} from 'native-base';
import {exportData, importData} from '@/utils/storage';

export default function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  return (
    <>
      <IconButton
        icon={<Icon as={MaterialIcons} name="more-vert" />}
        onPress={() => setIsOpen(true)}
        borderRadius="full"
        _icon={{color: 'gray.700'}}
        mr={1}
      />
      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Actionsheet.Content>
          <Actionsheet.Item
            startIcon={<Icon as={MaterialIcons} name="file-download" size="6" />}
            onPress={() => {
              setIsOpen(false);
              exportData(toast);
            }}>
            导出数据
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon as={MaterialIcons} name="file-upload" size="6" />}
            onPress={() => {
              setIsOpen(false);
              importData(toast);
            }}>
            导入数据
          </Actionsheet.Item>
          <Actionsheet.Item
            startIcon={<Icon as={MaterialIcons} name="info" size="6" />}
            isDisabled
            _text={{color: 'gray.400'}}>
            当前版本：v1.0.0
          </Actionsheet.Item>
          <Actionsheet.Item onPress={() => setIsOpen(false)}>取消</Actionsheet.Item>
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
}
