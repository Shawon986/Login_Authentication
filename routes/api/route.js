const express = require("express");
const bcrypt = require("bcrypt");
const Visitors = require("../../models/schema")
const router = express.Router()


//! Create Visitor
router.post("/", async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(req.body.password, salt);
      const password = hashedPass;
      const visitorObject = {
        name: req.body.name,
        email: req.body.email,
        password: password,
      };
      const visitor = new Visitors(visitorObject);
      res.status(201).json(visitor);
      await visitor.save();
    } catch (error) {
      console.error(error);
      res
        .status(400)
        .json({ message: "Something went wrong with the server !!!" });
    }
  });

  

  module.exports = router