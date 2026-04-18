export interface ScheduleSession {
  id: string;
  classId: string;
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
  teacher?: string;
  status?: 'Active' | 'Cancelled';
  notes?: string;
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';
}

export const CLASSES = ['10A', '10B', '11A', '11B', '12A', '12B', 'SCI-1', 'SCI-2', 'ART-A', 'ART-B'];

export const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

const BASE_SCHEDULE = [
  // 08:00
  { classId: '10A', startTime: '08:00', endTime: '09:00', subject: 'Homeroom', room: 'Rm 101', teacher: 'Mr. Anderson', status: 'Active' },
  { classId: '10B', startTime: '08:00', endTime: '09:00', subject: 'Homeroom', room: 'Rm 102', teacher: 'Ms. Baker', status: 'Active' },
  { classId: '11A', startTime: '08:00', endTime: '09:00', subject: 'Assembly', room: 'Audit.', teacher: 'Principal Skinner', status: 'Active' },
  { classId: '12A', startTime: '08:00', endTime: '09:00', subject: 'Homeroom', room: 'Rm 204', teacher: 'Mrs. Krabappel', status: 'Active' },

  // 09:00
  { classId: '10A', startTime: '09:00', endTime: '10:00', subject: 'Physics II', room: 'Rm 304', teacher: 'Dr. Octavius', status: 'Active' },
  { classId: '10B', startTime: '09:00', endTime: '10:00', subject: 'History', room: 'Rm 102', teacher: 'Mr. H. Zinn', status: 'Active' },
  { classId: '11A', startTime: '09:00', endTime: '10:00', subject: 'Eng. Lit', room: 'Rm 210', teacher: 'Ms. Keating', status: 'Active' },
  { classId: '11B', startTime: '09:00', endTime: '10:00', subject: 'Math Adv', room: 'Rm 212', teacher: 'Mr. Nash', status: 'Active' },
  { classId: '12A', startTime: '09:00', endTime: '10:00', subject: 'Bio Lab', room: 'Lab 3', teacher: 'Dr. Banner', status: 'Active' },

  // 10:00
  { classId: '10A', startTime: '10:00', endTime: '11:00', subject: 'Study Hall', room: 'Library', teacher: 'Mrs. Pince', status: 'Active' },
  { classId: '10B', startTime: '10:00', endTime: '11:00', subject: 'Chemistry', room: 'Lab 1', teacher: 'Mrs. Curie', status: 'Active', notes: "Safety goggles required for today's experiment." },
  { classId: '11A', startTime: '10:00', endTime: '11:00', subject: 'Gym', room: 'Field A', teacher: 'Coach Carr', status: 'Active' },
  { classId: '11B', startTime: '10:00', endTime: '11:00', subject: 'History', room: 'Rm 205', teacher: 'Mr. H. Zinn', status: 'Active' },
  { classId: '12A', startTime: '10:00', endTime: '11:00', subject: 'Economics', room: 'Rm 301', teacher: 'Mr. Keynes', status: 'Active' },

  // 11:00
  { classId: '10A', startTime: '11:00', endTime: '12:00', subject: 'Math 101', room: 'Rm 305', teacher: 'Mr. Euclid', status: 'Active' },
  { classId: '10B', startTime: '11:00', endTime: '12:00', subject: 'French', room: 'Rm 108', teacher: 'Mme. Dubois', status: 'Active' },
  { classId: '11A', startTime: '11:00', endTime: '12:00', subject: 'Cancelled', room: 'N/A', teacher: 'Dr. Smith', status: 'Cancelled' },
  { classId: '11B', startTime: '11:00', endTime: '12:00', subject: 'Comp Sci', room: 'Lab 2', teacher: 'Mr. Turing', status: 'Active' },
  { classId: '12A', startTime: '11:00', endTime: '12:00', subject: 'Physics I', room: 'Rm 302', teacher: 'Dr. Octavius', status: 'Active' },

  // 13:00
  { classId: '10A', startTime: '13:00', endTime: '14:00', subject: 'Art Hist', room: 'Rm 401', teacher: 'Ms. Kahlo', status: 'Active' },
  { classId: '10B', startTime: '13:00', endTime: '14:00', subject: 'Geography', room: 'Rm 202', teacher: 'Mr. Mercator', status: 'Active' },
  { classId: '11A', startTime: '13:00', endTime: '14:00', subject: 'Calculus', room: 'Rm 212', teacher: 'Mr. Leibniz', status: 'Active' },
  { classId: '11B', startTime: '13:00', endTime: '14:00', subject: 'Music', room: 'Band Room', teacher: 'Mr. Bach', status: 'Active' },
  { classId: '12A', startTime: '13:00', endTime: '14:00', subject: 'Study Hall', room: 'Library', teacher: 'Mrs. Pince', status: 'Active' },

  // 14:00
  { classId: '10A', startTime: '14:00', endTime: '15:00', subject: 'Comp Sci', room: 'Lab 2', teacher: 'Mr. Turing', status: 'Active' },
  { classId: '10B', startTime: '14:00', endTime: '15:00', subject: 'Comp Sci', room: 'Lab 2', teacher: 'Mr. Turing', status: 'Active' },
  { classId: '11A', startTime: '14:00', endTime: '15:00', subject: 'Chem II', room: 'Lab 1', teacher: 'Mrs. Curie', status: 'Active' },
  { classId: '11B', startTime: '14:00', endTime: '15:00', subject: 'Chem II', room: 'Lab 1', teacher: 'Mrs. Curie', status: 'Active' },
  { classId: '12A', startTime: '14:00', endTime: '15:00', subject: 'Debate', room: 'Rm 104', teacher: 'Mr. Cicero', status: 'Active' },

  // 15:00
  { classId: '11A', startTime: '15:00', endTime: '16:00', subject: 'Dismissal', room: 'Quad', teacher: 'N/A', status: 'Active' },
  { classId: '11B', startTime: '15:00', endTime: '16:00', subject: 'Club Act.', room: 'Gym', teacher: 'Coach Carr', status: 'Active' },
];

const DAYS: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI')[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

export const SCHEDULE_DATA: ScheduleSession[] = DAYS.flatMap((day, _dayIndex) => {
  return BASE_SCHEDULE.map((session, index) => {
    let modifiedSession = { ...session };

    if (day === 'TUE' || day === 'THU') {
      if (session.subject === 'Physics II') modifiedSession.subject = 'Physics Lab';
      if (session.subject === 'History') modifiedSession.subject = 'Civics';
      if (session.subject === 'Gym') modifiedSession.subject = 'Health';
    }

    if (day !== 'MON' && session.status === 'Cancelled') {
      modifiedSession.status = 'Active';
      modifiedSession.subject = 'Chemistry';
      modifiedSession.room = 'Lab 1';
    }

    return {
      ...modifiedSession,
      id: `${day}-${index}`,
      day: day,
      status: modifiedSession.status as 'Active' | 'Cancelled',
    };
  });
});
