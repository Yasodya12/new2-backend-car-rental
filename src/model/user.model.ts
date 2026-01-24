import mongoose from 'mongoose';

const userModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    nic: {
        type: String,
        required: true,
        unique: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: String
    },
    gender: {
        type: String,
        enum: ['Male', 'Female']
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        required: true
    },
    profileImage: {
        type: String
    },
    averageRating: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    experience: {
        type: Number,
        default: 0
    },
    provincesVisited: {
        type: [{
            province: {
                type: String,
                required: true
            },
            count: {
                type: Number,
                default: 1,
                min: 1
            }
        }],
        default: []
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    location: {
        lat: {
            type: Number
        },
        lng: {
            type: Number
        },
        address: {
            type: String
        }
    },
    isApproved: {
        type: Boolean,
        default: false
    }
})
const User = mongoose.model('User', userModel);
export default User