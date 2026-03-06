import React, { useState } from 'react';
import {
  TextInput,
  Text,
  View,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({ label, error, isPassword = false, ...rest }: InputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-sm font-medium text-gray-700 mb-1">{label}</Text>
      ) : null}
      <View className="relative">
        <TextInput
          className={`
            border rounded-xl px-4 py-3 text-base text-gray-900 bg-white
            ${error ? 'border-red-500' : 'border-gray-300'}
            focus:border-primary-500
          `}
          secureTextEntry={isPassword && !isVisible}
          placeholderTextColor="#9ca3af"
          {...rest}
        />
        {isPassword ? (
          <TouchableOpacity
            className="absolute right-4 top-3"
            onPress={() => setIsVisible((v) => !v)}
          >
            <Text className="text-gray-500 text-sm">{isVisible ? 'Ocultar' : 'Mostrar'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text className="text-red-500 text-xs mt-1">{error}</Text> : null}
    </View>
  );
}
