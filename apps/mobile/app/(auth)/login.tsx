import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@presentation/hooks/useAuth';
import { Button } from '@presentation/components/ui/Button';
import { Input } from '@presentation/components/ui/Input';

export default function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    try {
      await login(email, password);
      router.replace('/(app)/habits');
    } catch {
      // error is handled by the store
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta</Text>
        <Text className="text-base text-gray-500 mb-8">Entre para continuar sua rotina.</Text>

        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        ) : null}

        <Input
          label="Email"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Input
          label="Senha"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          isPassword
          autoComplete="password"
        />

        <Button
          label="Entrar"
          onPress={handleLogin}
          isLoading={isLoading}
          className="mt-2"
        />

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Ainda não tem conta? </Text>
          <Link href="/(auth)/register">
            <Text className="text-primary-600 font-semibold">Criar conta</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
