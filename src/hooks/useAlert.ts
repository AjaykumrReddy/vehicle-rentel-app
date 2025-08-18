import { useState } from 'react';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  title: string;
  message: string;
  buttons: AlertButton[];
  type?: 'success' | 'error' | 'warning' | 'info';
}

export const useAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
    setTimeout(() => setAlertConfig(null), 300);
  };

  const showSuccess = (title: string, message: string, buttons: AlertButton[] = [{ text: 'OK' }]) => {
    showAlert({ title, message, buttons, type: 'success' });
  };

  const showError = (title: string, message: string, buttons: AlertButton[] = [{ text: 'OK' }]) => {
    showAlert({ title, message, buttons, type: 'error' });
  };

  const showWarning = (title: string, message: string, buttons: AlertButton[]) => {
    showAlert({ title, message, buttons, type: 'warning' });
  };

  const showInfo = (title: string, message: string, buttons: AlertButton[]) => {
    showAlert({ title, message, buttons, type: 'info' });
  };

  return {
    alertConfig,
    visible,
    hideAlert,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};