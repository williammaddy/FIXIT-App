import { Service } from '../models/Service';

export const getActiveServices = async () => {
  return Service.find({ isActive: true }).select('name description icon isActive');
};
