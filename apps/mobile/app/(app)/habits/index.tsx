import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useHabits } from '@presentation/hooks/useHabits';
import { useAuth } from '@presentation/hooks/useAuth';
import { HabitDTO } from '@application/habit/dtos/HabitDTO';

export default function HabitsScreen() {
  const { habits, isLoading, todaysHabits, refresh } = useHabits();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace('/(auth)/login');
  }

  if (isLoading && habits.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Olá, {user?.name?.split(' ')[0]} 👋
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-gray-100 rounded-full px-4 py-2"
            onPress={handleLogout}
          >
            <Text className="text-gray-600 text-sm font-medium">Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Habit list */}
      <FlatList
        data={todaysHabits}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-6 py-4"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={['#4f46e5']}
            tintColor="#4f46e5"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-4xl mb-4">🌱</Text>
            <Text className="text-lg font-semibold text-gray-700">Nenhum hábito ainda</Text>
            <Text className="text-sm text-gray-400 mt-2 text-center">
              Crie seu primeiro hábito para começar sua rotina.
            </Text>
          </View>
        }
        renderItem={({ item }) => <HabitCard habit={item} />}
        ListFooterComponent={<View className="h-24" />}
      />

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-8 right-6 bg-primary-600 rounded-full w-14 h-14 items-center justify-center shadow-lg"
        onPress={() => router.push('/(app)/habits/new')}
      >
        <Text className="text-white text-3xl font-light leading-none">+</Text>
      </TouchableOpacity>
    </View>
  );
}

function HabitCard({ habit }: { habit: HabitDTO }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm active:opacity-80"
      onPress={() => router.push(`/(app)/habits/${habit.id}`)}
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: habit.color ?? '#e0eaff' }}
        >
          <Text className="text-2xl">{habit.emoji ?? '✨'}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{habit.title}</Text>
          {habit.description ? (
            <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
              {habit.description}
            </Text>
          ) : null}
        </View>
        <View className="ml-2">
          <Text className="text-gray-300 text-lg">›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
