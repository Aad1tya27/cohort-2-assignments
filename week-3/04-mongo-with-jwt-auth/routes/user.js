const { Router } = require("express");
const router = Router();
const userMiddleware = require("../middleware/user");
const { User, Course } = require("../db/index")
const jwt = require("jsonwebtoken")

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
        const token = jwt.sign({ username: req.body.username }, process.env.TOKEN_KEY_SECRET)

        return res.status(200).json({
            msg: "User created successfully",
            token: `Bearer ${token}`
        })
    }
    // }

    res.status(403).json({
        msg: "User already present"
    })
});

router.post('/signin', async (req, res) => {
    // Implement admin signup logic
    const existingUser = await User.findOne({ username: req.body.username })
    if (existingUser) {
        const token = jwt.sign({ username: req.body.username }, process.env.TOKEN_KEY_SECRET)
        return res.status(200).json({
            msg: "Signed in",
            token: `Bearer ${token}`
        })
    } else {
        res.status(403).json({
            msg: "User not found"
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
    const username = jwt.verify(req.headers.authorization.split(' ')[1], process.env.TOKEN_KEY_SECRET).username;
    const addedCourse = await Course.findById(req.params.courseId)
    if (!addedCourse) {
        return res.status(404).json({
            msg: "course not found"
        })
    }

    const oldUserDetails = await User.findOne({
        username
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
        // console.log('hi');
        
        await User.findOneAndUpdate({
            username
        },
            { $push: { purchasedCourses: req.params.courseId } },
            { new: true, useFindAndModify: false }
        );

        const userDetails = await User.findOne({
            username
        }).populate('purchasedCourses');

        res.json({
            msg: "Course Purchased"
        })
    }
});

router.get('/purchasedCourses', userMiddleware, async (req, res) => {
    // Implement fetching purchased courses logic
    const username = jwt.verify(req.headers.authorization.split(' ')[1], process.env.TOKEN_KEY_SECRET).username;
    const userDetails = await User.findOne({
        username
    }).populate("purchasedCourses")

    res.status(200).json({
        "Courses bought": userDetails.purchasedCourses,
    })
});

module.exports = router