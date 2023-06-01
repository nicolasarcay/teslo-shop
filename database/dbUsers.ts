import { User } from '../models';
import { db } from './';
import bcrypt from 'bcryptjs';

export const checkUserEmailPassword = async (
  email: string,
  password: string
) => {
  await db.connect();
  const user = await User.findOne({ email });
  await db.disconnect();

  if (!user) {
    return null;
  }

  if (!bcrypt.compareSync(password, user.password!)) {
    return null;
  }

  const { name, _id, role } = user;

  return {
    id: _id,
    email: email.toLowerCase(),
    role,
    name,
  };
};

// Esta es la verificacion de usuarios por red social OAuth

export const oAuthToDbUser = async (oAuthEmail: string, oAuthName: string) => {
  await db.connect();
  const user = await User.findOne({ email: oAuthEmail });
  // Si esta el user en la BD
  if (user) {
    await db.disconnect();
    const { _id, name, email, role } = user;
    return { _id, name, email, role };
  }
  //Creo el user en la BD
  const newUser = new User({
    email: oAuthEmail,
    name: oAuthName,
    password: '@',
    role: 'client',
  });
  await newUser.save();
  await db.disconnect();
  const { _id, name, email, role } = newUser;
  return { _id, name, email, role };
};
