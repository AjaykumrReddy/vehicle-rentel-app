import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sendOTP, verifyOTP } from '../../api/authService';
import { storeAuthData } from '../../utils/storage';

export default function OTPVerificationScreen({ navigation, route }: { navigation: any, route: any }) {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const { mobile } = route.params;
  const otpInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Auto-focus OTP input
    setTimeout(() => otpInputRef.current?.focus(), 500);
  }, []);

  const formatOTP = (text: string): string => {
    return text.replace(/\D/g, '').slice(0, 6);
  };

  const handleOTPChange = (text: string) => {
    const formatted = formatOTP(text);
    setOtp(formatted);
    if (error) setError('');
    
    // Auto-verify when 6 digits are entered
    if (formatted.length === 6) {
      Keyboard.dismiss();
      setTimeout(() => handleVerifyOTP(formatted), 300);
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp;
    
    if (codeToVerify.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const phoneNumber = mobile.replace('+91', '');
      const authResponse = await verifyOTP(phoneNumber, codeToVerify);
      await storeAuthData(authResponse);
      navigation.navigate('MainTabs');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      setOtp('');
      otpInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setError('');
    
    try {
      const phoneNumber = mobile.replace('+91', '');
      await sendOTP(phoneNumber);
      setTimer(30);
      Alert.alert('OTP Sent', `A new OTP has been sent to ${mobile}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setResending(false);
    }
  };

  const formatPhoneNumber = (phone: string): string => {
    if (phone.startsWith('+91')) {
      const number = phone.slice(3);
      return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
    }
    return phone;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to
          </Text>
          <Text style={styles.phoneNumber}>{formatPhoneNumber(mobile)}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={otpInputRef}
              style={[styles.otpInput, error ? styles.otpInputError : null]}
              placeholder="000000"
              placeholderTextColor="#ccc"
              value={otp}
              onChangeText={handleOTPChange}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              editable={!loading}
              autoFocus
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <TouchableOpacity 
            style={[styles.verifyButton, (otp.length !== 6 || loading) && styles.verifyButtonDisabled]} 
            onPress={() => handleVerifyOTP()}
            disabled={otp.length !== 6 || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP} disabled={resending}>
                {resending ? (
                  <ActivityIndicator color="#007AFF" size="small" />
                ) : (
                  <Text style={styles.resendText}>Resend OTP</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Change Mobile Number</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  otpInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
    fontSize: 24,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    letterSpacing: 8,
    fontWeight: '600',
  },
  otpInputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  timerText: {
    color: '#666',
    fontSize: 14,
  },
  resendText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
});