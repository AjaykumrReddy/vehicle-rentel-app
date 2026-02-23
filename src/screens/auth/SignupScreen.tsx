import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { sendOTP, registerUser } from '../../api/authService';
import { ActivityIndicator } from 'react-native';

export default function SignupScreen({ navigation }: { navigation: any }) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'rider' | 'owner' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  

  const handleSignup = async() => {
    if (!userType || !name || phoneNumber.length !== 10) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Create user in DB (unverified)
      const registerData = await registerUser({
        phone_number: phoneNumber,
        full_name: name,
        email: email || null,
        user_type: userType
      });

      console.log('User created:', registerData);

      // Step 2: Send OTP
      await sendOTP(phoneNumber);
      
      // Step 3: Navigate to OTP verification
      navigation.navigate('OTPVerification', {
        mobile: `+91${phoneNumber}`,
        phoneNumber,
        userId: registerData.id,
        name,
        email: email || '',
        userType,
        isSignup: true
      });
    } catch (err: any) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to create account. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Choose how you want to use the app</Text>
          </View>

          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                userType === 'rider' && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
              ]}
              onPress={() => setUserType('rider')}
            >
              <Text style={styles.userTypeIcon}>🚗</Text>
              <Text style={[styles.userTypeTitle, { color: colors.text }]}>I want to rent vehicles</Text>
              <Text style={[styles.userTypeDesc, { color: colors.textSecondary }]}>Book cars, bikes, and scooters</Text>
              {userType === 'rider' && <Text style={[styles.selectedIndicator, { color: colors.primary }]}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.userTypeCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                userType === 'owner' && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
              ]}
              onPress={() => setUserType('owner')}
            >
              <Text style={styles.userTypeIcon}>💰</Text>
              <Text style={[styles.userTypeTitle, { color: colors.text }]}>I want to rent out my vehicle</Text>
              <Text style={[styles.userTypeDesc, { color: colors.textSecondary }]}>Earn money from your vehicle</Text>
              {userType === 'owner' && <Text style={[styles.selectedIndicator, { color: colors.primary }]}>✓</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.phoneInputContainer}>
                <Text style={[styles.countryCode, { color: colors.text }]}>+91</Text>
                <TextInput
                  style={[styles.phoneInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                  placeholder="Phone Number"
                  placeholderTextColor={colors.textSecondary}
                  value={phoneNumber}
                  onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Email (Optional)"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.signupButton, 
                { backgroundColor: colors.primary },
                (loading || !userType || !name || phoneNumber.length !== 10) && { opacity: 0.5 }
              ]} 
              onPress={handleSignup}
              disabled={loading || !userType || !name || phoneNumber.length !== 10}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signupButtonText}>Continue with OTP</Text>
              )}
            </TouchableOpacity>

            {error ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            ) : (
              <Text style={[styles.otpInfo, { color: colors.textSecondary }]}>
                We'll send you a verification code
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.signInText, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  userTypeContainer: {
    marginBottom: 24,
    gap: 12,
  },
  userTypeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e1e5e9',
    alignItems: 'center',
    position: 'relative',
  },
  userTypeIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  userTypeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
    textAlign: 'center',
  },
  userTypeDesc: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 12,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    paddingLeft: 16,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 0,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  signupButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  otpInfo: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    color: '#ff4444',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  signInText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});