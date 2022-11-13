const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

router.post("/tasks", auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get("/tasks", auth, async (req, res) => {
    const limitTask = parseInt(req.query.limit);
    const skipTask = parseInt(req.query.skip);
    let tasks;
    const sortTask={}
    if (req.query.sortBy)
    {
        const order = req.query.sortBy.split(":");
        sortTask[order[0]] = order[1] === "desc" ? -1 : 1;
    }
    try {
        
        // await tasks.populate([{
        //     path: 'owner',
        //     match
        // }]);
        if (req.query.completed === 'true') {
            const completed = true
            tasks = await Task.find({ owner: req.user._id, completed }).limit(limitTask).skip(skipTask).sort(sortTask);
        }
        else if (req.query.completed === 'false') {
            const completed = false
            tasks = await Task.find({ owner: req.user._id, completed }).limit(limitTask).skip(skipTask).sort(sortTask);
        } else {
            tasks = await Task.find({ owner: req.user._id }).limit(limitTask).skip(skipTask).sort(sortTask);
        }
        res.send(tasks);
    } catch (e) {
        res.status(500).send();
    }
});

router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

router.patch("/tasks/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }
        updates.forEach((update) => (task[update] = req.body[update]));
        await task.save();

        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
