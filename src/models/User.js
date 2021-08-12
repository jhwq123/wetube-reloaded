import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type : String, required: true, unique: true},
    password: { type: String },
    email: { type: String, required: true, unique: true},
    socialOnly: { type: Boolean, default: false },
    avatarUrl: String,
    location: String,
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }]
});


userSchema.pre('save', async function () {
    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5);
    }
});

const User = mongoose.model('User', userSchema);

export default User;