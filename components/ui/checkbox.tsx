import React, { useState } from 'react';
import { Pressable, TouchableOpacity, View } from 'react-native';
import { styled } from 'nativewind';
import Checkbox, { CheckboxProps } from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';







const CheckBox: React.FC<CheckboxProps & {onCheckedChange? : (e: boolean) => void, checked?: boolean}> = ({
  onCheckedChange,
  checked,
  disabled = false,
  className,
  value,
  ...props
}) => {
  const [isChecked, setIsChecked] = useState(value);

  const handlePress = (e: boolean) => {

    setIsChecked(e);
    if (!disabled) {
      onCheckedChange?.(e);
    }
  };

  return (
    <>
      <ExpoCheckbox disabled={disabled}
        color={isChecked ? '#4630EB' : undefined}
        
        {...props} value={isChecked} onValueChange={(e) => handlePress(e)} />

    </>
  );
};

export { CheckBox };



function ExpoCheckbox({
  color,
  disabled,
  onChange,
  onValueChange,
  style,
  className,
  value,
  ...other
}: CheckboxProps) {
  const handleChange = () => {
    onValueChange?.(!value);
  };

  return (
    <TouchableOpacity
      {...other}
      disabled={disabled}
      // Announces "checked" status and "checkbox" as the focused element
      accessibilityRole="checkbox"
      accessibilityState={{ disabled, checked: value }}
      className= {cn("border rounded-full p-[2px] w-6 h-6 border-[#8B5CF6]" , className, {
        " ": value,
        "border-blue-200": disabled,
        "": value && disabled,
      })}
      
      onPress={handleChange}>
      {value && (
        <Ionicons 
        name={"checkmark"} 
        size={18} 
        color={color || "#10B981"} 
      />
      )}
    </TouchableOpacity>
  );
}
