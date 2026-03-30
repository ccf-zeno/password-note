import {Modal, Pressable, StyleSheet} from 'react-native';
import {Text, XStack, YStack} from 'tamagui';
import type {ReactNode} from 'react';

interface Action {
  label: string;
  color?: string;
  backgroundColor?: string;
  onPress: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string | ReactNode;
  actions: Action[];
}

const ConfirmDialog = ({open, onClose, title, description, actions}: Props) => {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={e => e.stopPropagation()}>
          <YStack gap="$3">
            <Text fontSize={18} fontWeight="700" color="#1e293b">
              {title}
            </Text>
            {typeof description === 'string' ? (
              <Text fontSize={15} color="#64748b" lineHeight={22}>
                {description}
              </Text>
            ) : (
              description
            )}
            <XStack justifyContent="flex-end" gap="$3" marginTop="$2">
              {actions.map((action, i) => (
                <Pressable
                  key={i}
                  onPress={action.onPress}
                  style={({pressed}) => [
                    styles.btn,
                    {backgroundColor: action.backgroundColor || '#f1f5f9'},
                    pressed && styles.btnPressed,
                  ]}>
                  <Text
                    fontSize={15}
                    fontWeight={i === actions.length - 1 ? '600' : '500'}
                    color={action.color || '#64748b'}>
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </XStack>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnPressed: {
    opacity: 0.7,
  },
});

export default ConfirmDialog;
