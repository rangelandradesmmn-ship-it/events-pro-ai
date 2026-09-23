'use client';

import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';

export function GoogleCalendarButton({ title, date, startTime, location, details }: { title: string, date: string, startTime: string, location: string, details: string }) {
  const handleAddToCalendar = () => {
    // Convert YYYY-MM-DD and HH:MM to Google Calendar format (YYYYMMDDTHHmmssZ)
    // Note: To keep it simple and handle timezones properly without huge date libs, 
    // we use the local timezone formatting that Google Calendar accepts (omitting the Z)
    const formattedDate = date.replace(/-/g, '');
    let startStr = formattedDate;
    let endStr = formattedDate;

    if (startTime) {
      const cleanTime = startTime.replace(':', '') + '00';
      startStr = `${formattedDate}T${cleanTime}`;
      
      // Add 1 hour for end time
      const hour = parseInt(startTime.split(':')[0]) + 1;
      const endCleanTime = hour.toString().padStart(2, '0') + startTime.split(':')[1] + '00';
      endStr = `${formattedDate}T${endCleanTime}`;
    }

    const text = encodeURIComponent(title);
    const dates = encodeURIComponent(`${startStr}/${endStr}`);
    const detailsParam = encodeURIComponent(details || '');
    const locationParam = encodeURIComponent(location || '');

    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${detailsParam}&location=${locationParam}`;
    window.open(gCalUrl, '_blank');
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="w-full h-8 text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
      onClick={handleAddToCalendar}
      title="Adicionar ao Google Agenda"
      type="button"
    >
      <CalendarDays className="mr-2 h-3 w-3" /> Adicionar ao GCalendar
    </Button>
  );
}
