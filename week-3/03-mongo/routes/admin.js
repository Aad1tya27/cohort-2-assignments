const { Router } = require("express");
const adminMiddleware = require("../middleware/admin");
const router = Router();
const z = require("zod")
const {Admin , Course} = require("../db/index")
// const Course = require("../db/index")


// Admin Routes
router.post('/signup', async (req, res) => {
    // Implement admin signup logic
    // const usernameSchema = z.string().email()
    // const passwordSchema = z.string()
    // if( usernameSchema.safeParse(req.body.username).success && passwordSchema.safeParse(req.body.password).success ){
    const existingUser = await Admin.findOne({ username: req.body.username })
    if (!existingUser) {
        const newUser = new Admin({
            username: req.body.username,
            password: req.body.password
        })
        await newUser.save()

        return res.status(200).json({
            msg: "Admin created successfully",
            newUser
        })
    }
    // }

    res.status(403).json({
        msg: "invalid something"
    })

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