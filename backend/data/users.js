import bcrypt from 'bcryptjs';

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    isAdmin: true,
  },
  {
    name: 'Justin Cho',
    email: 'justin@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'Amber Lai',
    email: 'amber@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
];

export default users;
