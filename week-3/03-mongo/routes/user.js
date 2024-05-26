const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const { User, Course } = require("../db/index")

// const User = require("../db/index")
// const Course = require("../db/index")

// User Routes
router.post('/signup', async (req, res) => {
    // Implement user signup logic
    const existingUser = await User.findOne({ username: req.body.username })
    if (!existingUser) {
        const newUser = new User({
            username: req.body.username,
            password: req.body.password
        })
        await newUser.save()

        return res.status(200).json({
            msg: "User created successfully",
            newUser
        })
    }
});

router.get('/courses', async (req, res) => {
    // Implement listing all courses logic
    const allCourses = await Course.find({})
    console.log(allCourses);
    res.status(200).json({
        Courses: allCourses
    })
});

router.post('/courses/:courseId', userMiddleware, async (req, res) => {
    // Implement course purchase logic
    const addedCourse = await Course.findById(req.params.courseId)
    if (!addedCourse) {
        return res.status(404).json({
            msg: "kis course ki baat karra hai saale"
        })
    }

    const oldUserDetails = await User.findOne({
        username: req.headers.username,
        password: req.headers.password
    }).populate('purchasedCourses');
    let found = 0;
    oldUserDetails.purchasedCourses.forEach(course => {
        // console.log(course["_id"],addedCourse["_id"],course["_id"] == addedCourse["_id"]);
        if (course["_id"].toString() == addedCourse["_id"].toString()) {
            found = 1;

        }
    });
    if (found) {
        return res.status(403).json({
            msg: "You have already purchased the course"
        })
    } else {
        await User.findOneAndUpdate({
            username: req.headers.username
        },
            { $push: { purchasedCourses: req.params.courseId } },
            { new: true, useFindAndModify: false }
        );

        const userDetails = await User.findOne({
            username: req.headers.username,
            password: req.headers.password
        }).populate('purchasedCourses');

        res.json({
            msg: "course purchased",
            "User Details": userDetails
        })
    }
});

router.get('/purchasedCourses', userMiddleware, async (req, res) => {
    // Implement fetching purchased courses logic
    const userDetails = await User.findOne({
        username: req.headers.username,
        password: req.headers.password
    }).populate("purchasedCourses")


    res.status(200).json({
        "Courses bought": userDetails,
    })

});

module.exports = router