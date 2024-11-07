const mongoos = require("mongoose")
const appointmentSchema = new mongoos.Schema({
    doctorId: { type: String, required: true },
    userId: { type: String, required: true },
    doctorInfo: { type: Object, required: true },
    userInfo: { type: Object, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    room:{type:String, required: true, default: ""},
    status: { type: String, required: true, default: "pending" }
}, {
    timestamps: true
})

const appointmentModel = mongoos.model("appointments", appointmentSchema)
module.exports = appointmentModel
