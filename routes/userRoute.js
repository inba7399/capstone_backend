const express = require("express");
const router = express.Router();
const User = require("../models/userModle");
const Doctor = require("../models/doctorModle")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const authMiddleware = require("../middleware/authMiddleware");
const Appointment = require("../models/appointment")
const moment = require("moment")

router.post("/signup", async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email });
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
        if(!emailRegex.test(req.body.email)){
            return res.status(200).send({ message: "Give a valid email", success: false })
        }
        if(!passwordRegex.test(req.body.password)){
            return res.status(200).send({ message: "Give a strong Password ", success: false })
        }
        
        if (userExists) {
            return res.status(200).send({ message: "user already exist", success: false })
        } 
            else {
            const password = req.body.password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            req.body.password = hashedPassword
            const newuser = new User(req.body);
            await newuser.save();
            res.status(200).send({ message: "User created successfully", success: true })
        }

    } catch (error) {
        return res.status(500).send({ message: "internal server error", success: false })
    }
})

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailRegex.test(req.body.email)){
            return res.status(200).send({ message: "Give a valid email", success: false })
        }
        if (!user) {
            return res
                .status(200)
                .send({ message: "user does not exist", success: false })
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password)
        if (!isMatch) {
            return res
                .status(200)
                .send({ message: "Password is incorrect", success: false })
        } else {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })
            res.status(200).send({ message: "Log in successfull", success: true, data: token })

        }

    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "internal server error", success: false })
    }
})

router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId })
        user.password = undefined
        if (!user) {
            return res.status(200).send({ message: "User does not exist", success: false })
        } else {
            res.status(200).send({
                success: true, data: user,
            })
        }
    } catch (error) {
        res.status(500).send({ message: "Error getting user info", success: false, error })
    }
})

router.post("/apply-doctor-account", async (req, res) => {
    try {
        const newdoctor = new Doctor({ ...req.body, status: "pending" })
        await newdoctor.save()
        const adminUser = await User.findOne({ isAdmin: true })

        const unseenNotificatons = adminUser.unseenNotificatons
        unseenNotificatons.push({
            type: "new-doctor-request",
            message: `${newdoctor.firstName} ${newdoctor.lastName} has applyed for a doctor account`,
            data: {
                doctorId: newdoctor._id,
                name: newdoctor.firstName + ' ' + newdoctor.lastName
            },
            onClickPath: '/admin/doctors'
        })
        await User.findByIdAndUpdate(adminUser._id, { unseenNotificatons })
        res.status(200).send({
            success: true,
            message: "Doctor request sent successfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "error applying doctor account", success: false })
    }
})

router.post("/mark-all-notifications-as-seen", async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId })
        const unseenNotificatons = user.unseenNotificatons
        const seenNotificatons = user.seenNotificatons
        seenNotificatons.push(...unseenNotificatons)
        user.unseenNotificatons = [];
        user.seenNotificatons = seenNotificatons
        const updatedUser = await user.save()
        updatedUser.password = undefined
        res.send({ success: true, message: "all notifications marked as seeen", data: updatedUser })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "error ", success: false })
    }
})

router.post("/delete-all-notifications", async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId })
        user.unseenNotificatons = []
        user.seenNotificatons = []
        const updatedUser = await User.findByIdAndUpdate(user._id, user)
        updatedUser.password = undefined
        res.send({ success: true, message: "all notifications cleared", data: updatedUser })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "error ", success: false })
    }
})

router.get("/get-all-approved-doctors", authMiddleware, async (req, res) => {
    try {
        const doctors = await Doctor.find({ status: "approved" })
        res.send({ message: "all requests feched", success: true, data: doctors })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "error ", success: false, error })
    }
})

router.post('/book-appointment', authMiddleware, async (req, res) => {
    try {
        req.body.status = "pending"
        req.body.date= moment(req.body.date , 'DD-MM-YYYY').toISOString()
        req.body.time= moment(req.body.time,"HH:mm").toISOString()
        const newAppointment = new Appointment(req.body)
        await newAppointment.save()
        const user = await User.findOne({ _id: req.body.doctorInfo.userId })
        user.unseenNotificatons.push({
            type: "new appointment request",
            message: `A new counsiling appointment was given by ${req.body.userInfo.name} `,
            onclickPath: "/doctor/appointment"
        })
        await user.save()
        res.status(200).send({ message: "Appointment booked successfully", success: true })
    } catch (error) {
        res.status(500).send({
            message: "error booking appointments",
            success: false,
            error
        })
    }
})

router.post('/check-booking-avilability', authMiddleware, async (req, res) => {
    try {
        const date = moment(req.body.date, "DD-MM-YYYY").toISOString()
        const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hours").toISOString()
        const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString()
        const doctorId = req.body.doctorId
        const appointments = await Appointment.find({
            doctorId,
            date,
            time: { $gte: fromTime, $lte: toTime },
        })
        if (appointments.length > 0) {
            return res.status(200).send({
                message: "Appointment not available",
                success: false
            })
        } else {
            return res.status(200).send({
                message: "Appointment available",
                success: true
            })

        }

    } catch (error) {
        res.status(500).send({
            message: "error booking appointments",
            success: false,
            error
        })
    }
})

router.get("/get-appointments-by-user-id", authMiddleware, async (req, res) => {
    try {
        const appointments = await Appointment.find({userId:req.body.userId})
        res.send({ message: "all requests feched", success: true, data: appointments })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "error ", success: false, error })
    }
})

module.exports = router