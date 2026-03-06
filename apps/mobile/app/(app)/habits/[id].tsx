import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-14 pb-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-primary-600 text-base">‹ Voltar</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Detalhes do Hábito</Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-gray-400 text-sm">ID: {id}</Text>
        <Text className="text-gray-500 mt-4 text-center">
          Detalhes do hábito serão implementados aqui.
        </Text>
      </View>
    </View>
  );
}
