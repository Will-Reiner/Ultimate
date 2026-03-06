import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@presentation/hooks/useAuth';
import { Button } from '@presentation/components/ui/Button';
import { Input } from '@presentation/components/ui/Input';

export default function RegisterScreen() {
  const { register, isLoading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister() {
    try {
      await register(name, email, password);
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
        <Text className="text-3xl font-bold text-gray-900 mb-2">Criar conta</Text>
        <Text className="text-base text-gray-500 mb-8">Comece sua jornada de hábitos.</Text>

        {error ? (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        ) : null}

        <Input
          label="Nome"
          placeholder="Seu nome"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
        />

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
          placeholder="Mínimo 8 caracteres"
          value={password}
          onChangeText={setPassword}
          isPassword
          autoComplete="new-password"
        />

        <Button
          label="Criar conta"
          onPress={handleRegister}
          isLoading={isLoading}
          className="mt-2"
        />

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500">Já tem conta? </Text>
          <Link href="/(auth)/login">
            <Text className="text-primary-600 font-semibold">Entrar</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
