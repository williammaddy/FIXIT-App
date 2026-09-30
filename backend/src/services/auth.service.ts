import { User, IUser } from '../models/User';
import { WorkerProfile } from '../models/WorkerProfile';
import { ApiError } from '../utils/ApiError';
import { generateToken } from '../utils/generateToken';

export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'worker';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export const registerUser = async (data: RegisterDTO) => {
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    password: data.password,
    role: data.role,
  });

  if (data.role === 'worker') {
    await WorkerProfile.create({
      user: user._id,
      isAvailable: false,
      isVerified: true,
    });
  }

  const token = generateToken(user._id.toString(), user.role);

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
    },
  };
};

export const loginUser = async (data: LoginDTO) => {
  const user = await User.findOne({ email: data.email.toLowerCase() }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(data.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id.toString(), user.role);

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
    },
  };
};

export const getCurrentUser = async (user: IUser) => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profileImage: user.profileImage,
  };
};
