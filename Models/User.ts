//import { model, models, Schema } from "mongoose";
import mongoose, {Schema , model , models} from "mongoose";

import bcrypt from "bcryptjs";


export interface IUser {
    email: string;
    password: string;
    username?: string;
    followers?: mongoose.Types.ObjectId[];
    following?: mongoose.Types.ObjectId[];
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        username: { type: String, unique: true, sparse: true },
        followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
        following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    {
        timestamps: true,
    }
);  
    
userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }  
});

const User = models?.User || model<IUser>("User", userSchema);

export default User;