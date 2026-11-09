const text = (value, name = 'Name') => {
  const result = String(value ?? '').trim();
  if (!result || result.length > 100) throw Error(`${name} must contain 1–100 characters.`);
  return result;
};
const positive = value => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 999) throw Error('Enter a whole number between 1 and 999.');
  return n;
};
const date = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '') || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) throw Error('Enter a valid date.');
  return value;
};
function find(list, id) { const record = list.find(r => r.id === id); if (!record) throw Error('Choose an existing demo record.'); return record; }
export function seed(project) {
  if (project === 'seis') return {next:10,students:[{id:'S1',name:'Demo Student A',program:'BSCS'},{id:'S2',name:'Demo Student B',program:'BSIT'},{id:'S3',name:'Demo Student C',program:'BSCS'}],courses:[{id:'C1',name:'CS101 · Introduction to Computing',capacity:2},{id:'C2',name:'IT102 · Web Fundamentals',capacity:3}],enrollments:[{studentId:'S1',courseId:'C1'}]};
  if (project === 'alaga') return {next:10,medicines:[{id:'M1',name:'Demo medicine A',stock:20},{id:'M2',name:'Demo medicine B',stock:12}],doses:[{id:'D1',medicineId:'M1',time:'08:00',status:'Not recorded'},{id:'D2',medicineId:'M2',time:'12:00',status:'Not recorded'},{id:'D3',medicineId:'M1',time:'20:00',status:'Not recorded'}],history:[]};
  if (project === 'boja') return {next:10,cases:[{id:'B1',title:'Demo case A',status:'In review'},{id:'B2',title:'Demo case B',status:'In progress'}],documents:[{id:'N1',caseId:'B1',title:'Sample intake note'},{id:'N2',caseId:'B2',title:'Sample document checklist'}],deadlines:[{id:'T1',caseId:'B1',title:'Review preparation',date:'2026-11-12',status:'Pending'},{id:'T2',caseId:'B2',title:'Document review',date:'2026-11-16',status:'Pending'}]};
  throw Error('Unknown project.');
}
export function applyAction(current, project, action, data = {}) {
  const s = structuredClone(current);
  const id = () => `DEMO-${s.next++}`;
  if (project === 'seis') {
    if (action === 'student') s.students.push({id:id(),name:text(data.name,'Student name'),program:text(data.program,'Program')});
    else if (action === 'course') s.courses.push({id:id(),name:text(data.name,'Course name'),capacity:positive(data.capacity)});
    else if (action === 'enroll') {
      find(s.students,data.studentId); const course = find(s.courses,data.courseId);
      if (s.enrollments.some(e => e.studentId === data.studentId && e.courseId === data.courseId)) throw Error('This student is already enrolled in that course.');
      if (s.enrollments.filter(e => e.courseId === data.courseId).length >= course.capacity) throw Error('That course is full. Choose another course.');
      s.enrollments.push({studentId:data.studentId,courseId:data.courseId});
    } else if (action === 'withdraw') s.enrollments = s.enrollments.filter(e => !(e.studentId === data.studentId && e.courseId === data.courseId));
    else throw Error('Unknown enrollment action.');
  } else if (project === 'alaga') {
    if (action === 'record') {
      const dose = find(s.doses,data.id), medicine = find(s.medicines,dose.medicineId);
      if (!['Taken','Skipped','Snoozed'].includes(data.status)) throw Error('Choose a valid outcome.');
      if (['Taken','Skipped'].includes(dose.status)) throw Error('Undo the existing record before recording another outcome.');
      if (dose.status === 'Snoozed' && data.status === 'Snoozed') throw Error('This demo dose is already snoozed.');
      if (data.status === 'Taken' && medicine.stock < 1) throw Error('No demo units remain. Add demo stock first.');
      s.history.push({id:id(),doseId:dose.id,medicine:medicine.name,time:dose.time,status:data.status,previous:dose.status,undone:false});
      dose.status = data.status;
      if (data.status === 'Taken') medicine.stock--;
    } else if (action === 'undo') {
      const dose = find(s.doses,data.id), medicine = find(s.medicines,dose.medicineId);
      const event = s.history.findLast(e => e.doseId === dose.id && !e.undone);
      if (!event) throw Error('There is no demo record to undo.');
      if (event.status === 'Taken') medicine.stock++;
      dose.status = event.previous; event.undone = true;
    } else if (action === 'refill') find(s.medicines,data.id).stock += positive(data.amount);
    else throw Error('Unknown care-log action.');
  } else if (project === 'boja') {
    if (action === 'case') s.cases.push({id:id(),title:text(data.title,'Case title'),status:'In progress'});
    else if (action === 'document') {find(s.cases,data.caseId);s.documents.push({id:id(),caseId:data.caseId,title:text(data.title,'Document title')});}
    else if (action === 'deadline') {find(s.cases,data.caseId);s.deadlines.push({id:id(),caseId:data.caseId,title:text(data.title,'Task title'),date:date(data.date),status:'Pending'});}
    else if (action === 'complete') {const item=find(s.deadlines,data.id);item.status=item.status==='Done'?'Pending':'Done';}
    else if (action === 'caseStatus') {if (!['In review','In progress','Closed'].includes(data.status)) throw Error('Choose a valid case status.');find(s.cases,data.id).status=data.status;}
    else throw Error('Unknown case-workspace action.');
  } else throw Error('Unknown project.');
  return s;
}
