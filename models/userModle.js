const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isDoctor: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    seenNotificatons: { type: Array, default: [] },
    unseenNotificatons: { type: Array, default: [] },
    status: { type: String, default: "pending" }
}, {
    timestamps: true
})

const userModel = mongoose.model("user", userSchema)

module.exports = userModel