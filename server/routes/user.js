const express = require("express");
const Router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/user.model");
const Blog = require("../models/blog.model");


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})

const upload = multer({ storage: storage })


Router.post("/data", async(req, res) => {
    const { token } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        return res
            .status(200)
            .send({ id: user._id, name: user.name, email: user.email });
    } catch (err) {
        return res.status(401).send({ error: "Invalid token" });
    }
});

Router.post("/profile", async(req, res) => {
    const { token } = req.body;

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        //user id de admin
        if (user.id != "62b4debb7d93d3ceeb7981c1") {
            const blogs = await Blog.find({ author_id: user._id });
            const likedBlogs = await Blog.find({ likes: decoded._id });
            return res.status(200).send({
                id: user._id,
                name: user.name,
                email: user.email,
                blogs: blogs,
                likedBlogs: likedBlogs,
            });

        } else {

            const blogs = await Blog.find();

            const likedBlogs = await Blog.find();
            return res.status(200).send({
                id: user._id,
                name: user.name,
                email: user.email,
                blogs: blogs,
                likedBlogs: likedBlogs,
            });

        }


    } catch (err) {
        return res.status(401).send({ error: "Invalid token" });
    }
});

Router.get("/posts", async(req, res) => {
    const blogs = await Blog.find({});
    return res.status(200).send({ blogs: blogs });
});


Router.get("/post/:id", async(req, res) => {
    const { id } = req.params;
    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).send({ error: "Blog not found" });
        }
        return res.status(200).send({ blog: blog });
    } catch (err) {
        return res.status(404).send({ error: "Blog not found" });
    }
});

Router.post("/post/like/:id", async(req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
    const blog = await Blog.findById(id);
    if (!blog) {
        return res.status(404).send({ error: "Blog not found" });
    }
    blog.likes.push(user_id);
    await blog.save();
    return res.status(200).send({ blog: blog });
});

Router.post("/post/unlike/:id", async(req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;
    const blog = await Blog.findById(id);
    if (!blog) {
        return res.status(404).send({ error: "Blog not found" });
    }
    const index = blog.likes.indexOf(user_id);
    blog.likes.splice(index, 1);
    await blog.save();
    return res.status(200).send({ blog: blog });
});

Router.post("/post/comment/:id", async(req, res) => {
    const { id } = req.params;
    const { user_id, comment } = req.body;
    const blog = await Blog.findById(id);
    if (!blog) {
        return res.status(404).send({ error: "Blog not found" });
    }
    const user = await User.findById(user_id);
    blog.comments.push({
        name: user.name,
        comment: comment,
        date: new Date(),
    });
    await blog.save();
    return res.status(200).send({ blog: blog });
});

Router.post("/create", upload.single("image"), async(req, res) => {
    const { title, content, date, token } = req.body;
    console.log(req.body)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
        return res.status(404).send({ error: "User not found" });
    }
    const blog = new Blog({
        title,
        content,
        image: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        author: user.name,
        author_id: user._id,
        created_at: date,
    });
    await blog.save();
    user.blogs.push(blog._id);
    await user.save();
    return res.status(200).send({
        message: "Blog created successfully",
    });

});



Router.post("/edit", upload.single("image"), async(req, res) => {
    const { title, content, date, id, token, image } = req.body;

    if (req.file) {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).send({ error: "Blog not found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        blog.title = title;
        blog.content = content;
        blog.image = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
        blog.created_at = date;
        await blog.save();
        return res.status(200).send({
            message: "Blog updated successfully",
        });


    } else {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).send({ error: "Blog not found" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        blog.title = title;
        blog.content = content;
        blog.created_at = date;
        await blog.save();
        return res.status(200).send({
            message: "Blog updated successfully",
        });
    }
});







Router.post("/delete", upload.single("image"), async(req, res) => {
    const { id, token } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).send({ error: "Blog not found" });
        }

        const index = user.blogs.indexOf(id);
        user.blogs.splice(index, 1);
        await user.save();
        await blog.remove();
        if (user.id != "62b4debb7d93d3ceeb7981c1") {

            const blogs = await Blog.find({ author_id: user._id });
            const likedBlogs = await Blog.find({ likes: decoded._id });
            return res.status(200).send({
                blogs: blogs,
                likedBlogs: likedBlogs,
            });
        } else {
            const blogs = await Blog.find();
            const likedBlogs = await Blog.find();
            return res.status(200).send({
                blogs: blogs,
                likedBlogs: likedBlogs,
            });

        }

    } catch (err) {
        return res.status(401).send({ error: "Invalid token" });
    }
});

module.exports = Router;