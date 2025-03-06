import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, useTheme } from '@mui/material';
import { tokens } from '../../theme';

// Mock events - in a real application, you'd fetch these from Gmail API
const mockEvents = [
  { 
    id: '1', 
    title: 'Family Dinner', 
    start: new Date(new Date().setHours(19, 0, 0, 0)),
    end: new Date(new Date().setHours(21, 0, 0, 0)),
    backgroundColor: '#4cceac'
  },
  { 
    id: '2', 
    title: 'Doctor Appointment', 
    start: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(10, 0, 0, 0),
    allDay: true,
    backgroundColor: '#7286d3'
  },
  { 
    id: '3', 
    title: 'Meeting with Contractor', 
    start: new Date(new Date().setDate(new Date().getDate() + 2)).setHours(14, 0, 0, 0),
    end: new Date(new Date().setDate(new Date().getDate() + 2)).setHours(15, 30, 0, 0),
    backgroundColor: '#ff9a9a'
  },
];

interface FullCalendarComponentProps {
  daysToShow?: number;
}

const FullCalendarComponent = ({ daysToShow = 3 }: FullCalendarComponentProps) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState(mockEvents);

  // In a real app, you'd implement a function to fetch events from Gmail
  // const fetchGmailEvents = async () => { ... }

  return (
    <Box width="100%" height="100%">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView='timeGridThreeDay'
        views={{
          timeGridThreeDay: {
            type: 'timeGrid',
            duration: { days: daysToShow }
          }
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: ''
        }}
        height="100%"
        events={currentEvents}
        nowIndicator={true}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        dayMaxEvents={true}
        eventColor={colors.greenAccent[500]}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }}
        themeSystem="standard"
        // In a real app, you would handle these events to connect to Gmail
        // eventAdd={handleEventAdd}
        // eventChange={handleEventChange}
        // eventRemove={handleEventDelete}
      />
    </Box>
  );
};

export default FullCalendarComponent;