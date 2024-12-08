import React, { useEffect, useState } from 'react';
import { View, Text, Button, SafeAreaView } from 'react-native';
import { setAlarm, dismissAlarm } from 'expo-alarm';
// import AlarmModule, { removeAlarm, scheduleAlarm, stopAlarm  } from "expo-alarm-module";
// import { AlarmResult } from 'expo-alarm/build/ExpoAlarm.types';





const App = () => {


    const [alarm, setAlarmResult] = useState()

    const alarmIn60 = async () => {
        var newDate = new Date();
        newDate.setSeconds(newDate.getSeconds() + 60);

        const data = await setAlarm({
            days: [1],
            "hour": newDate.getHours(),
            "minutes": newDate.getMinutes(),
            message: 'Wake up!',
            //ringtoneUri: 'exampleRingtoneUri',
            "extra": {"label": "youcef"},
            vibrate: true,
            skipUi: false,
        })

        console.log({data})
        setAlarmResult(data)
    };

    /* Create a new alarm 60 seconds after the current date.*/
    const onStopAlarmButton = () => {
        // Stops any alarm that is playing
        // stopAlarm();
        
        // // Removes the alarm. Also stops any alarm that is playing, so the above function stopAlarm is redundant.
        // removeAlarm("alarm1");
        dismissAlarm({"extra": {label: "youcef"}})

    };

    return (
        <SafeAreaView>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>React Native Alarm Test</Text>
            <Button title="Alarm in 60 seconds" onPress={alarmIn60} />
            <Button title="Stop Alarm" onPress={onStopAlarmButton} />
        </View>
        </SafeAreaView>
    );
};

export default App;