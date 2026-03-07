import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useHabits } from '@presentation/hooks/useHabits';
import { Button } from '@presentation/components/ui/Button';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    selectedDetail,
    isLoading,
    fetchHabitDetail,
    completeHabit,
    archiveHabit,
  } = useHabits();

  useEffect(() => {
    if (id) fetchHabitDetail(id);
  }, [id]);

  if (isLoading || !selectedDetail) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const { habit, streak, monthEntries, completedToday } = selectedDetail;
  const isBuild = habit.type === 'build';

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const completedDays = new Set(
    monthEntries.map((e) => new Date(e.completedAt).getDate()),
  );

  async function handleComplete() {
    if (!id) return;
    try {
      await completeHabit(id);
      fetchHabitDetail(id);
    } catch {
      Alert.alert('Erro', 'Nao foi possivel registrar.');
    }
  }

  async function handleArchive() {
    if (!id) return;
    Alert.alert('Arquivar habito', 'Tem certeza que deseja arquivar este habito?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Arquivar',
        style: 'destructive',
        onPress: async () => {
          try {
            await archiveHabit(id);
            router.back();
          } catch {
            Alert.alert('Erro', 'Nao foi possivel arquivar.');
          }
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-14 pb-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-primary-600 text-base">{'< Voltar'}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1" numberOfLines={1}>
          {habit.title}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 py-6">
        {/* Habit info */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm items-center">
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
            style={{ backgroundColor: habit.color ?? '#e0eaff' }}
          >
            <Text className="text-3xl">{habit.emoji ?? (isBuild ? '✨' : '🚫')}</Text>
          </View>
          <Text className="text-lg font-bold text-gray-900">{habit.title}</Text>
          <Text className="text-sm text-gray-500 mt-1">
            {isBuild ? 'Construir' : 'Largar'} · {habit.frequency.type === 'daily' ? 'Diario' : 'Semanal'}
          </Text>
          {isBuild && habit.goalValue ? (
            <Text className="text-sm text-primary-600 mt-1">
              Meta: {habit.goalValue} {habit.goalUnit ?? ''}
            </Text>
          ) : null}
          {habit.reminderTime ? (
            <Text className="text-sm text-gray-400 mt-1">Lembrete: {habit.reminderTime}</Text>
          ) : null}
        </View>

        {/* Streaks */}
        <View className="flex-row mb-4">
          <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm items-center">
            <Text className="text-3xl font-bold text-primary-600">{streak.currentStreak}</Text>
            <Text className="text-xs text-gray-500 mt-1">Streak atual</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm items-center">
            <Text className="text-3xl font-bold text-amber-500">{streak.bestStreak}</Text>
            <Text className="text-xs text-gray-500 mt-1">Melhor streak</Text>
          </View>
        </View>

        {/* Calendar */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-bold text-gray-700 mb-3 text-center">
            {MONTH_NAMES[month]} {year}
          </Text>
          <View className="flex-row mb-2">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <View key={i} className="flex-1 items-center">
                <Text className="text-xs text-gray-400 font-medium">{d}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row flex-wrap">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <View key={`empty-${i}`} className="w-[14.28%] h-10" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isCompleted = completedDays.has(day);
              const isToday = day === now.getDate();
              return (
                <View key={day} className="w-[14.28%] h-10 items-center justify-center">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      isCompleted
                        ? isBuild ? 'bg-primary-500' : 'bg-green-500'
                        : isToday ? 'border border-primary-300' : ''
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        isCompleted ? 'text-white font-bold' : isToday ? 'text-primary-600 font-semibold' : 'text-gray-600'
                      }`}
                    >
                      {day}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Check-in button */}
        {!completedToday && (
          <View className="mb-4">
            <Button
              label={isBuild ? 'Concluir hoje' : 'Dia limpo!'}
              onPress={handleComplete}
              isLoading={isLoading}
            />
          </View>
        )}
        {completedToday && (
          <View className="bg-green-50 rounded-2xl p-4 mb-4 items-center">
            <Text className="text-green-700 font-semibold">Feito hoje!</Text>
          </View>
        )}

        {/* Action buttons */}
        <View className="flex-row mb-8">
          <View className="flex-1 mr-2">
            <Button
              label="Editar"
              variant="secondary"
              onPress={() => router.push(`/(app)/habits/${id}/edit`)}
            />
          </View>
          <View className="flex-1 ml-2">
            <Button
              label="Arquivar"
              variant="ghost"
              onPress={handleArchive}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
