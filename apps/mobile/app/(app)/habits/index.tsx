import React from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useHabits } from '@hooks/useHabits';
import { HabitDTO } from '@app-types/habit';

export default function HabitsScreen() {
  const { buildHabits, quitHabits, isLoading, habits, refresh } = useHabits();

  const sections = [
    ...(buildHabits.length > 0 ? [{ title: 'Construir', data: buildHabits }] : []),
    ...(quitHabits.length > 0 ? [{ title: 'Largar', data: quitHabits }] : []),
  ];

  if (isLoading && habits.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-6 pt-14 pb-4"
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
            <Text className="text-lg font-semibold text-gray-700">Nenhum habito ainda</Text>
            <Text className="text-sm text-gray-400 mt-2 text-center">
              Crie seu primeiro habito para comecar sua rotina.
            </Text>
          </View>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View className="pt-4 pb-2">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }) => <HabitCard habit={item} />}
        ListFooterComponent={<View className="h-24" />}
        stickySectionHeadersEnabled={false}
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
  const isBuild = habit.type === 'build';

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm active:opacity-80"
      onPress={() => router.push(`/(app)/habits/${habit.id}`)}
    >
      <View className="flex-row items-center">
        <View
          className="w-12 h-12 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: '#e0eaff' }}
        >
          <Text className="text-2xl">{isBuild ? '✨' : '🚫'}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{habit.name}</Text>
          {isBuild && habit.goal ? (
            <Text className="text-sm text-gray-500 mt-0.5">
              Meta: {habit.goal.target_value} {habit.goal.target_unit ?? ''}
            </Text>
          ) : null}
          {!isBuild ? (
            <Text className="text-sm text-gray-500 mt-0.5">
              Manter o foco
            </Text>
          ) : null}
        </View>
        <View className="ml-2">
          <Text className="text-gray-300 text-lg">{'>'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
