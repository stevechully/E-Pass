export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  // Additional roles for future use
  STUDENT: 'student',
  FACULTY: 'faculty',
  STAFF: 'staff',
  GUEST: 'guest'
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 4,
  [ROLES.STAFF]: 3,
  [ROLES.FACULTY]: 2,
  [ROLES.STUDENT]: 1,
  [ROLES.USER]: 1,
  [ROLES.GUEST]: 0
};
