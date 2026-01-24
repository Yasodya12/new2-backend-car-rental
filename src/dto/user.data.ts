export interface UserDTO {
    _id?: any,
    name: string,
    email: string,
    password?: string | null
    role: string
    nic?: string | null
    contactNumber?: string | null
    dateOfBirth?: string | null
    gender?: 'Male' | 'Female' | null
    profileImage?: string | null | undefined
    averageRating?: number
    totalRatings?: number
    experience?: number
    provincesVisited?: {
        province: string;
        count: number;
    }[]
    isAvailable?: boolean;
    isApproved?: boolean;
    licenseImage?: string | null;
    idImage?: string | null;
    location?: {
        lat?: number | null
        lng?: number | null
        address?: string | null
    } | null
}