import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';

const scheduleData = {
  'Class 10': {
    Monday: [
      { time: '08:30 - 09:15 AM', subject: 'Mathematics', teacher: 'Dr. Sharma', room: 'Room 101' },
      { time: '09:15 - 10:00 AM', subject: 'Physics', teacher: 'Mrs. Verma', room: 'Physics Lab' },
      { time: '10:00 - 10:45 AM', subject: 'English Core', teacher: 'Mr. David', room: 'Room 101' },
      { time: '10:45 - 11:15 AM', subject: 'RECESS & LUNCH', teacher: 'Campus', room: 'Cafeteria' },
      { time: '11:15 - 12:00 PM', subject: 'Chemistry', teacher: 'Dr. Patel', room: 'Chem Lab' },
      { time: '12:00 - 12:45 PM', subject: 'Computer Science', teacher: 'Mr. Khan', room: 'CS Lab 2' }
    ],
    Tuesday: [
      { time: '08:30 - 09:15 AM', subject: 'Social Science', teacher: 'Mrs. Roy', room: 'Room 101' },
      { time: '09:15 - 10:00 AM', subject: 'Mathematics', teacher: 'Dr. Sharma', room: 'Room 101' },
      { time: '10:00 - 10:45 AM', subject: 'Biology', teacher: 'Dr. Meera', room: 'Bio Lab' },
      { time: '10:45 - 11:15 AM', subject: 'RECESS & LUNCH', teacher: 'Campus', room: 'Cafeteria' },
      { time: '11:15 - 12:00 PM', subject: 'English Literature', teacher: 'Mr. David', room: 'Room 101' },
      { time: '12:00 - 12:45 PM', subject: 'Physical Education', teacher: 'Coach Singh', room: 'Sports Ground' }
    ]
  }
};

export default function ClassTimetable({ selectedClass = 'Class 10' }) {
  const [activeDay, setActiveDay] = useState('Monday');
  const periods = scheduleData[selectedClass]?.[activeDay] || scheduleData['Class 10']['Monday'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="text-blue-400 w-5 h-5" /> Official Class Timetable ({selectedClass})
          </h3>
          <p className="text-xs text-slate-400">Institutional daily period schedule & faculty allocation</p>
        </div>

        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeDay === day ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {periods.map((slot, index) => {
          const isBreak = slot.subject.includes('RECESS');
          return (
            <div
              key={index}
              className={`p-4 rounded-2xl border transition-all ${
                isBreak
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                  : 'bg-slate-950 border-slate-800/80 hover:border-blue-500/30 text-white'
              }`}
            >
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> {slot.time}
                </span>
                <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-300 font-bold">
                  {slot.room}
                </span>
              </div>
              <h4 className="font-bold text-sm mt-1">{slot.subject}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{slot.teacher}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
