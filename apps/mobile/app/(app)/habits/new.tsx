import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useHabits } from '@hooks/useHabits';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { HabitType, FrequencyType } from '@app-types/habit';

export default function NewHabitScreen() {
  const { createHabit, isLoading } = useHabits();

  const [type, setType] = useState<HabitType>('build');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [frequencyDays, setFrequencyDays] = useState<number[]>([]);
  const [goalValue, setGoalValue] = useState('');
  const [goalUnit, setGoalUnit] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  const toggleDay = (day: number) => {
    setFrequencyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  };

  async function handleSubmit() {
    if (!name.trim()) {
      Alert.alert('Erro', 'Preencha o titulo do habito.');
      return;
    }

    try {
      await createHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        frequency_type: frequencyType,
        ...(frequencyType === 'weekly' ? { frequency_days: frequencyDays } : {}),
        goal_target_value: goalValue ? parseInt(goalValue, 10) : undefined,
        goal_target_unit: goalUnit.trim() || undefined,
        reminders: reminderTime.trim() ? [reminderTime.trim()] : undefined,
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
          value={name}
          onChangeText={setName}
        />

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
                className={`w-10 h-10 rounded-full items-center justify-center ${frequencyDays.includes(i) ? 'bg-primary-600' : 'bg-gray-200'}`}
                onPress={() => toggleDay(i)}
              >
                <Text className={`text-xs font-medium ${frequencyDays.includes(i) ? 'text-white' : 'text-gray-600'}`}>
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
            disabled={!name.trim()}
          />
        </View>
      </ScrollView>
    </View>
  );
}
