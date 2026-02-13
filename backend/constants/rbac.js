const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    PRINCIPAL: 'principal',
    HOD: 'hod',
    FACULTY: 'faculty',
    STUDENT: 'student'
};

const MODULES = {
    FACULTY_MANAGEMENT: 'faculty_management',
    FACULTY_ACADEMICS: 'faculty_academics',
    STUDENT_ACADEMICS: 'student_academics',
    ATTENDANCE: 'attendance',
    CONTENT: 'content',
    TIMETABLE: 'timetable',
    CHAT: 'chat'
};

const PERMISSIONS = {
    VIEW: 'view',
    CREATE: 'create',
    EDIT: 'edit',
    DELETE: 'delete',
    CONTROL: 'control'
};

module.exports = { ROLES, MODULES, PERMISSIONS };
