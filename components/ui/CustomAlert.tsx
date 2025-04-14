import React, { useState } from 'react';
import { Modal, Text, View, TouchableOpacity } from 'react-native';
import { Dialog, Portal, Button } from 'react-native-paper';

interface CustomAlertProps {
  visible: boolean;
  onDismiss: () => void;
  message: string;
  title?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, onDismiss, message, title = 'Alert' }) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>OK</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default CustomAlert;
