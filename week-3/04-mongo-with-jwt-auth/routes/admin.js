const { Router } = require("express");
const adminMiddleware = require("../middleware/admin");
const router = Router();
const jwt = require("jsonwebtoken")
const { Admin, Course } = require("../db/index")

// Admin Routes
router.post('/signup', async (req, res) => {
    // Implement admin signup logic
    console.log(process.env.TOKEN_KEY_SECRET);
    
    const existingUser = await Admin.findOne({ username: req.body.username })
    if (!existingUser) {
        const newUser = new Admin({
            username: req.body.username,
            password: req.body.password
        })
        await newUser.save()
        const token = jwt.sign({ username: req.body.username }, process.env.TOKEN_KEY_SECRET)

        return res.status(200).json({
            msg: "Admin created successfully",
            token: `Bearer ${token}`
        })
    }
    // }

    res.status(403).json({
        msg: "Admin already present"
    })
});

router.post('/signin', async (req, res) => {
    // Implement admin signup logic
    const existingUser = await Admin.findOne({ username: req.body.username })
    if (existingUser) {
        const token = jwt.sign({ username: req.body.username }, process.env.TOKEN_KEY_SECRET)
        return res.status(200).json({
            msg: "signed in",
            token: `Bearer ${token}`
        })
    } else {
        res.status(403).json({
            msg: "Admin not found"
        })
    }
});

router.post('/courses', adminMiddleware, async (req, res) => {
    // Implement course creation logic
    const {title,description, price,imageLink} = req.body;
    const existingCourse = await Course.findOne({
        title,
        description,
        price,
        imageLink
    })
    if(existingCourse){
        return res.status(403).json({
            msg:"course already present"
        })
    }
    try {
        const course = new Course ({
            title,
            description,
            price,
            imageLink
        })
        await course.save()
        return res.status(201).json({
            msg:"created new course",
        })
    } catch (err) {
        return res.status(500).send("internal server error")
    }
});

router.get('/courses', adminMiddleware, async (req, res) => {
    // Implement fetching all courses logic
    const allCourses = await Course.find({})
    console.log(allCourses);
    res.status(200).json({
        Courses: allCourses
    })
});

module.exports = router;