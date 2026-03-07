import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useHabits } from '@presentation/hooks/useHabits';
import { useAuth } from '@presentation/hooks/useAuth';
import { Button } from '@presentation/components/ui/Button';
import { Input } from '@presentation/components/ui/Input';
import { HabitType } from '@domain/habit/entities/Habit';
import { FrequencyType } from '@domain/habit/value-objects/Frequency';

const COLORS = ['#e0eaff', '#dbeafe', '#d1fae5', '#fef3c7', '#fce7f3', '#ede9fe', '#fee2e2'];
const EMOJIS_BUILD = ['💪', '📚', '🧘', '🏃', '💧', '🥗', '✍️', '🎯'];
const EMOJIS_QUIT = ['🚫', '🚭', '🍺', '📱', '🍩', '☕', '🎮', '⏰'];

export default function NewHabitScreen() {
  const { createHabit, isLoading } = useHabits();
  const { user } = useAuth();

  const [type, setType] = useState<HabitType>('build');
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('');
  const [description, setDescription] = useState('');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [goalValue, setGoalValue] = useState('');
  const [goalUnit, setGoalUnit] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const emojis = type === 'build' ? EMOJIS_BUILD : EMOJIS_QUIT;

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  };

  async function handleSubmit() {
    if (!user?.id || !title.trim()) {
      Alert.alert('Erro', 'Preencha o titulo do habito.');
      return;
    }

    try {
      await createHabit({
        userId: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        emoji: emoji || undefined,
        type,
        frequency: {
          type: frequencyType,
          ...(frequencyType === 'weekly' ? { daysOfWeek } : {}),
        },
        goalValue: goalValue ? parseInt(goalValue, 10) : undefined,
        goalUnit: goalUnit.trim() || undefined,
        reminderTime: reminderTime.trim() || undefined,
        color,
      });
      router.back();
    } catch {
      Alert.alert('Erro', 'Nao foi possivel criar o habito.');
    }
  }

  const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-14 pb-4 shadow-sm flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-primary-600 text-base">{'< Voltar'}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Novo Habito</Text>
      </View>

      <ScrollView className="flex-1 px-6" contentContainerClassName="py-6">
        {/* Type selector */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Tipo</Text>
        <View className="flex-row mb-6">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl mr-2 items-center ${type === 'build' ? 'bg-primary-600' : 'bg-gray-200'}`}
            onPress={() => setType('build')}
          >
            <Text className={type === 'build' ? 'text-white font-semibold' : 'text-gray-600'}>
              Construir
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ml-2 items-center ${type === 'quit' ? 'bg-red-500' : 'bg-gray-200'}`}
            onPress={() => setType('quit')}
          >
            <Text className={type === 'quit' ? 'text-white font-semibold' : 'text-gray-600'}>
              Largar
            </Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Titulo"
          placeholder="Ex: Beber agua"
          value={title}
          onChangeText={setTitle}
        />

        {/* Emoji picker */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Emoji</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {emojis.map((e) => (
            <TouchableOpacity
              key={e}
              className={`w-12 h-12 rounded-xl items-center justify-center mr-2 ${emoji === e ? 'bg-primary-100 border-2 border-primary-500' : 'bg-gray-100'}`}
              onPress={() => setEmoji(e)}
            >
              <Text className="text-2xl">{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Frequency */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Frequencia</Text>
        <View className="flex-row mb-4">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl mr-2 items-center ${frequencyType === 'daily' ? 'bg-primary-600' : 'bg-gray-200'}`}
            onPress={() => setFrequencyType('daily')}
          >
            <Text className={frequencyType === 'daily' ? 'text-white font-semibold' : 'text-gray-600'}>
              Diario
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ml-2 items-center ${frequencyType === 'weekly' ? 'bg-primary-600' : 'bg-gray-200'}`}
            onPress={() => setFrequencyType('weekly')}
          >
            <Text className={frequencyType === 'weekly' ? 'text-white font-semibold' : 'text-gray-600'}>
              Semanal
            </Text>
          </TouchableOpacity>
        </View>

        {frequencyType === 'weekly' && (
          <View className="flex-row justify-between mb-4">
            {DAYS.map((day, i) => (
              <TouchableOpacity
                key={day}
                className={`w-10 h-10 rounded-full items-center justify-center ${daysOfWeek.includes(i) ? 'bg-primary-600' : 'bg-gray-200'}`}
                onPress={() => toggleDay(i)}
              >
                <Text className={`text-xs font-medium ${daysOfWeek.includes(i) ? 'text-white' : 'text-gray-600'}`}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Goal (build only) */}
        {type === 'build' && (
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Input
                label="Meta (opcional)"
                placeholder="8"
                value={goalValue}
                onChangeText={setGoalValue}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1 ml-2">
              <Input
                label="Unidade"
                placeholder="copos"
                value={goalUnit}
                onChangeText={setGoalUnit}
              />
            </View>
          </View>
        )}

        {/* Color */}
        <Text className="text-sm font-medium text-gray-700 mb-2">Cor</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              className={`w-10 h-10 rounded-full mr-2 ${color === c ? 'border-2 border-primary-500' : ''}`}
              style={{ backgroundColor: c }}
              onPress={() => setColor(c)}
            />
          ))}
        </ScrollView>

        {/* Reminder */}
        <Input
          label="Lembrete (HH:mm)"
          placeholder="08:00"
          value={reminderTime}
          onChangeText={setReminderTime}
        />

        {/* Description */}
        <Input
          label="Descricao (opcional)"
          placeholder="Por que esse habito e importante?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <View className="mt-4 mb-8">
          <Button
            label="Criar Habito"
            onPress={handleSubmit}
            isLoading={isLoading}
            disabled={!title.trim()}
          />
        </View>
      </ScrollView>
    </View>
  );
}
