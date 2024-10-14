import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';
import { Controller, FieldValues, RegisterOptions } from 'react-hook-form';
import { TextInput, TextInputProps, View, Text } from 'react-native';

export interface InputProps extends TextInputProps {
  containerClassName?: string;
}

const Input = forwardRef<TextInput, InputProps>(
  ({ className, containerClassName, ...props }, ref) => {
    return (
      <View className={`my-2 ${containerClassName || ''}`}>
        <TextInput
          className={`h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${className || ''}`}
          placeholderTextColor="#a1a1aa"
          ref={ref}
          {...props}
        />
      </View>
    );
  }
);

Input.displayName = "Input";


type CustomInputProps = {
  control : any
  name: string,
  rules : Omit<RegisterOptions<FieldValues, string>, "disabled" | "setValueAs" | "valueAsNumber" | "valueAsDate"> | undefined,
  placeholder?: string,
  secureTextEntry?: boolean,
  containerClassName?: string,
  Icon?: React.ReactNode

}

const CustomInput = ({
  control,
  name,
  rules = {},
  placeholder,
  secureTextEntry,
  containerClassName,
  Icon
}: CustomInputProps) => {
  return (
    <Controller
      
      control={control}
      name={name}
      rules={rules}
      render={({field: {value, onChange, onBlur}, fieldState: {error}}) => (
        <>
          <View
            className= {containerClassName}
            style={[
              
              {borderColor: error ? 'red' : '#e8e8e8'},
            ]}>
             {Icon}
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder}
              className= {cn("w-full rounded-lg p-1 flex-1")}
              secureTextEntry={secureTextEntry}
            />
          </View>
          {error && (
            <Text style={{color: 'red', alignSelf: 'stretch'}}>{error.message || 'Error'}</Text>
          )}
        </>
      )}
    />
  );
};

export { Input, CustomInput };
