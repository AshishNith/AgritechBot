import { UserProfile } from '../types/api';

export function isProfileComplete(user: UserProfile | null | undefined): boolean {
  if (!user) {
    return false;
  }

  const hasName = Boolean(user.name?.trim());
  const hasCrops = Boolean(user.crops?.length);
  const hasValidLandSize = typeof user.landSize === 'number' && user.landSize > 0;
  const hasLocation = Boolean(user.location?.state?.trim() && user.location?.district?.trim());

  return hasName && hasCrops && hasValidLandSize && hasLocation;
}