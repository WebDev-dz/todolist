import { Task } from "@/store/taskStore";
import { MarkedDates } from "react-native-calendars/src/types";


const today = new Date().toISOString().split('T')[0];
const fastDate = getPastDate(3);
const futureDates = getFutureDates(12);
const dates = [fastDate, today].concat(futureDates);

function getFutureDates(numberOfDays: number) {
  const array: string[] = [];
  for (let index = 1; index <= numberOfDays; index++) {
    let d = Date.now();
    if (index > 8) {
      // set dates on the next month
      const newMonth = new Date(d).getMonth() + 1;
      d = new Date(d).setMonth(newMonth);
    }
    const date = new Date(d + 864e5 * index); // 864e5 == 86400000 == 24*60*60*1000
    const dateString = date.toISOString().split('T')[0];
    array.push(dateString);
  }
  return array;
}
function getPastDate(numberOfDays: number) {
  return new Date(Date.now() - 864e5 * numberOfDays).toISOString().split('T')[0];
}



export type AgendaItem = {
  title: string,
  data: Task[]
}






export const agendaItems : AgendaItem[] = [
  {
    title: dates[0],
    data: [
      {
        id: '1',
        title: 'Project Kickoff Meeting',
        description: 'Initial meeting to discuss project goals, deliverables, and timelines.',
        completed: false,
        startDate: '2024-10-07',
        startTime: '2024-10-07T09:45:00',
        notes: 'Prepare project overview presentation.',
        attachments: [
          {
            id: '1',
            name: 'ProjectOverview.pdf',
            type: 'pdf',
            uri: 'https://example.com/ProjectOverview.pdf',
          },
        ],
        alertTime: '2024-10-07T09:45:00',
        subtasks: [
          {
            id: '1-1',
            title: 'Create agenda',
            completed: true,
          },
          {
            id: '1-2',
            title: 'Send calendar invites',
            completed: false,
          },
        ],
        createdAt: '2024-10-01T09:00:00',
        updatedAt: '2024-10-05T10:30:00',
      },
      {
        id: '2',
        title: 'Design Review',
        description: 'Review the initial design concepts for the project.',
        completed: false,
        startDate: '2024-10-08',
        startTime: '2024-10-07T09:45:00',
        notes: 'Collect feedback from stakeholders.',
        attachments: [
          {
            id: '2',
            name: 'DesignConcepts.pptx',
            type: 'pptx',
            uri: 'https://example.com/DesignConcepts.pptx',
          },
        ],
        alertTime: '2024-10-08T01:45:00',
        subtasks: [
          {
            id: '2-1',
            title: 'Prepare design slides',
            completed: true,
          },
          {
            id: '2-2',
            title: 'Get stakeholder feedback',
            completed: false,
          },
        ],
        createdAt: '2024-10-02T11:00:00',
        updatedAt: '2024-10-06T15:00:00',
      },
      {
        id: '3',
        title: 'Finalize Budget',
        description: 'Complete and submit the final budget for approval.',
        completed: true,
        startDate: null,
        startTime: null,
        notes: 'Ensure all departments have submitted their estimates.',
        attachments: [
          {
            id: '3',
            name: 'FinalBudget.xlsx',
            type: 'xlsx',
            uri: 'https://example.com/FinalBudget.xlsx',
          },
        ],
        alertTime: null,
        subtasks: [
          {
            id: '3-1',
            title: 'Collect department estimates',
            completed: true,
          },
          {
            id: '3-2',
            title: 'Compile final document',
            completed: true,
          },
        ],
        createdAt: '2024-09-30T14:00:00',
        updatedAt: '2024-10-03T16:00:00',
      }
    ],
  },

];

export function getMarkedDates() {
  const marked: MarkedDates = {};

  agendaItems.forEach(item => {
    // NOTE: only mark dates with data
    if (item.data && item.data.length > 0 && (item.data[0])) {
      marked[item.title] = {marked: true};
    } else {
      marked[item.title] = {disabled: true};
    }
  });
  return marked;
}