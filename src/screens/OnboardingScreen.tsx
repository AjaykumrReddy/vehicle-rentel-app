import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function OnboardingScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <Image source={require('../../assets/onboarding.png')} style={styles.image} />
            <Text style={styles.title}>Rent Vehicles Near You</Text>
            <Text style={styles.subtitle}>Find, book, and drive easily with our rental app</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Map')}>
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
    image: { width: 250, height: 250, marginBottom: 32, resizeMode: 'contain' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32, color: '#666' },
    button: { backgroundColor: '#007AFF', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
