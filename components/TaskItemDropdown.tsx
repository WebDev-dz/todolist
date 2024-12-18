import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { router } from 'expo-router';
import { TaskItem } from './TaskItem';
import { Task } from '@/store/taskStore';

 type Item = {
    label: string,
    value: keys,
    icon: React.JSX.Element
 }
const data : Item []= [
    { label: 'Edit', value: "1", icon: <AntDesign size={20} name="edit" /> },
    { label: 'Duplicate', value: "2", icon: <AntDesign size={20} name="copy1" /> },
    { label: 'Delete', value: "3", icon: <AntDesign color={"red"} size={20} name="delete" /> },


];

type keys = "1" | "2" | "3"


type Props = {
    onDublicate : () => void;
    onDelete: () => void;
    task: Task
}

const DropdownComponent = ({task, onDublicate, onDelete}: Props) => {
    const [value, setValue] = useState<null | keys>(null);
    const [isFocus, setIsFocus] = useState(false);

    const actions = {
        "1": router.push,
        "2": onDublicate,
        "3": onDelete

    }

    const renderLabel = () => {
        if (value || isFocus) {
            return (
                <Text style={[styles.label, isFocus && { color: 'blue' }]}>
                    Dropdown label
                </Text>
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            {/* {renderLabel()} */}
            <Dropdown
                style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}

                iconStyle={styles.iconStyle}
                data={data}
                dropdownPosition="auto"
                renderItem={(item) => <TouchableOpacity onPress={(e) => {
                    const value = item.value
                    if (item.value == "1") {
                        actions[item.value](`/addTask?id=${task.id}`)
                    } else {actions[item.value]()}

                }} className='flex bg-white flex-row flex-nowrap items-center gap-2 h-12'>
                    {item.icon}
                    <Text className='text-md'>  {item.label} </Text>
                </TouchableOpacity>}
                containerStyle={{ marginLeft: -10, padding: 10 }}
                maxHeight={300}
                labelField="label"
                valueField="value"

                value={value}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
                onChange={item => {
                    setValue(item.value);
                    setIsFocus(false);
                }}
                renderLeftIcon={() => (
                    <Entypo name="dots-three-vertical"
                        style={styles.icon}
                        color={isFocus ? 'blue' : 'black'}
                        size={20}
                    />
                )}
            />
        </View>
    );
};

export default DropdownComponent;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        padding: 16,
        overflow: "hidden"
    },
    dropdown: {
        paddingHorizontal: 8,
        position: "absolute"
    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
});