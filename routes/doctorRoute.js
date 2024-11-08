const express = require("express")
const router = express.Router()
const Doctor = require("../models/doctorModle")
const Appointment = require("../models/appointment")
const User =require("../models/userModle")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/get-doctor-info-by-user-id", authMiddleware, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.body.userId })
        res.status(200).send({ success: true, message: "Doctor info fetched successfully", data: doctor })
    } catch (error) {
        res.status(500).send({ message: "Error getting  info", success: false, error })
    }
})

router.post("/update-doctor-profile", authMiddleware, async (req, res) => {
    try {
        const doctor = await Doctor.findOneAndUpdate({ userId: req.body.userId }, req.body)
        res.status(200).send({ success: true, message: "Doctor info updated successfully", data: doctor })
    } catch (error) {
        res.status(500).send({ message: "Error getting  info", success: false, error })
    }
})

router.post("/get-doctor-info-by-id", authMiddleware, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ _id: req.body.doctorId })
        res.status(200).send({ success: true, message: "Doctor info fetched successfully", data: doctor })
    } catch (error) {
        res.status(500).send({ message: "Error getting  info", success: false, error })
    }
})

router.get("/get-appointments-by-doctor-id", authMiddleware, async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.body.userId })
        const appointments = await Appointment.find({ doctorId: doctor._id })
        res.send({ message: "all requests feched", success: true, data: appointments })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "error ", success: false, error })
    }
})

router.post("/change-appointment-status", authMiddleware, async (req, res) => {
    try {
        const { appointmentId, status } = req.body
        const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status })
        const user = await User.findOne({ _id: appointment.userId })
        const unseenNotificatons = user.unseenNotificatons
        unseenNotificatons.push({
            type: "new-appointment-request",
            message: `${appointment.doctorInfo.firstName} ${appointment.doctorInfo.lastName} have changed your appointment status to ${status}`,
            onClickPath: '/appointment'
        });

        await user.save()
        res.status(200).send({ message: " updated successfully", success: true})
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "error ", success: false, error })
    }
})

module.exports = router