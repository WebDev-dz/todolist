import { TouchableOpacity, View, Text } from "react-native";

interface DayProps {
    date: Date;
    isSelected: boolean;
    hasTask: boolean;
    sameMonth: boolean;
    onSelect: () => void;
    currentMonth?: Date;
    isDarkMode: boolean;
  }
  
export  const DayCell: React.FC<DayProps> = ({ date, isSelected, currentMonth, sameMonth, hasTask, onSelect, isDarkMode }) => (
    <TouchableOpacity
      onPress={onSelect}
      className={`items-center justify-center w-12 h-12 rounded-full mx-0.5 
        ${isSelected ? 'bg-blue-500' : hasTask ? 'bg-blue-100/50' : 'bg-transparent'}`}
    >
      <Text className={`text-sm ${isSelected ? 'text-white font-bold' : sameMonth ? (isDarkMode ? 'text-gray-100' : 'text-gray-800') : 'text-gray-400'}`}>
        {date.getDate()}
      </Text>
      {hasTask && !isSelected && (
        <View className="w-1 h-1 bg-blue-500 rounded-full mt-1" />
      )}
    </TouchableOpacity>
  );