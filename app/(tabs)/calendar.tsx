import React, { useCallback, useState, useMemo } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { AgendaItem, agendaItems, getMarkedDates } from '@/mocks/agendaItems';
import testIDs from '@/lib/testIDs';
import { getTheme, lightThemeColor, themeColor } from '@/mocks/theme';
import { format, getMonth, parseISO } from 'date-fns';
import TabBar from '@/components/TabBar';
import { TaskItem } from '@/components/TaskItem';
import { Task } from '@/store/taskStore';
import ExpandableCalendar, { Positions } from '@/lib/calendars/expandableCalendar';
import { UpdateSources } from '@/lib/calendars/expandableCalendar/commons';
import CalendarProvider from '@/lib/calendars/expandableCalendar/Context/Provider';
import WeekCalendar from '@/lib/calendars/expandableCalendar/WeekCalendar';
import { AgendaList, DateData } from '@/lib/calendars';

const leftArrowIcon = require('@/assets/icons/back-arrow.png');
const rightArrowIcon = require('@/assets/icons/front-arrow.png');
const ITEMS = agendaItems;

interface Props {
  weekView?: boolean;
}

const ExpandableCalendarScreen = (props: Props) => {
  const { weekView } = props;
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const marked = useMemo(() => getMarkedDates(), []);
  const theme = useMemo(() => getTheme(), []);
  const todayBtnTheme = useMemo(() => ({ todayButtonTextColor: themeColor }), []);

  const selectedItems = useMemo(() => {
    return ITEMS.filter(item => format(item.title, "yyyy-MM-dd") === selectedDate);
  }, [selectedDate]);

  const onDateChanged = useCallback((date: string, updateSource: UpdateSources) => {
    console.log('ExpandableCalendarScreen onDateChanged: ', date, updateSource);
    setSelectedDate(date);
  }, []);

  const onMonthChange = useCallback(({ dateString }: { dateString: string }) => {
    console.log('ExpandableCalendarScreen onMonthChange: ', dateString);
  }, []);

  const renderItem = useCallback(({ item }: { item: Task }) => {
    return <TaskItem task={item} />;
  }, []);

  const renderArrow = useCallback((direction: 'left' | 'right') => {
    const icon = direction === 'left' ? leftArrowIcon : rightArrowIcon;
    return <Image style={{ objectFit: 'cover' }} height={15} width={15} source={icon} />;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View className='flex-row justify-between'>
        <Text className='text-lg'>
          {getMonth(selectedDate)}
        </Text>
      </View>
      <CalendarProvider
        date={ITEMS[0]?.title}
        onDateChanged={onDateChanged}
        onMonthChange={onMonthChange}
        disabledOpacity={0.6}
        theme={todayBtnTheme}
      >

        {false ? (
          <>

            <WeekCalendar
              testID={testIDs.weekCalendar.CONTAINER}
              className='mt-3'
              firstDay={2}
              markedDates={marked}
              onDayPress={(date) => { console.log(date.dateString); setSelectedDate(date.dateString) }}

            // renderHeader={(date) => (<View className='flex-row justify-between'> <Text>{getMonth(date)}</Text> </View>)}

            />
          </>
        ) : (
          <ExpandableCalendar
            testID={testIDs.expandableCalendar.CONTAINER}
            theme={theme}
            disablePan
            initialPosition={Positions.OPEN}
            markedDates={marked}
            
            renderArrow={renderArrow}
            current = {selectedDate}
            onDayPress = {(date) => {setSelectedDate(date.dateString)}}
            
            
          />
        )}

        <AgendaList
          sections={selectedItems}
          renderItem={renderItem}
        // sectionStyle={styles.section}
        />
      </CalendarProvider>
      <TabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray-100',
    paddingTop: 40,
  },
  section: {
    backgroundColor: lightThemeColor,
    color: 'grey',
    textTransform: 'capitalize'
  }
});

export default ExpandableCalendarScreen;