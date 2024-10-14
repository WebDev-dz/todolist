import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { SafeAreaView, Text } from "react-native";
import { Button } from "./button";
import { useState } from "react";

 const App = () => {
    const [date, setDate] = useState(new Date(1598051730000));
  
    const onChange = (event, selectedDate) => {
      const currentDate = selectedDate;
      setDate(currentDate);
    };
  
    const showMode = (currentMode) => {
      DateTimePickerAndroid.open({
        value: date,
        onChange,
        mode: currentMode,
        is24Hour: true,
      });
    };
  
    const showDatepicker = () => {
      showMode('date');
    };
  
    const showTimepicker = () => {
      showMode('time');
    };
  
    return (
      <SafeAreaView>
        <Button onPress={showDatepicker} label="Show date picker!" />
        <Button onPress={showTimepicker} label="Show time picker!" />
        <Text>selected: {date.toLocaleString()}</Text>
      </SafeAreaView>
    );
  };


  export default App;