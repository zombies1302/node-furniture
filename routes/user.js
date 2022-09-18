const User = require("../models/User");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const fs = require('fs');
const PRIVATE_KEY = fs.readFileSync('./private-key.txt');


function verifyToken(req, res, next) {
  const authorizationClient = req.headers['authorization'];
  const token = authorizationClient && authorizationClient.split(' ')[1]
  if (!token) return res.sendStatus(401)
    try {
      const userInfo = jwt.verify(token, PRIVATE_KEY,(err, user) => {
        if (err) res.status(403).json("Token is not valid!");
        res.user = user;
        next();
      })
    } catch (e) {
      return res.sendStatus(403)
    }
  }


  router.post("/", async (req, res) => {
    const newUser = new User(req.body);
    try {
      const savedUser = await newUser.save();
      res.status(200).json(savedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  router.post("/login", async (req, res) => {
    try {

      const user = await User.findOne({ username: req.body.username });
      !user && res.status(401).json("Wrong credentials!");
      if ( user.password !== req.body.password ){
        res.status(401).json("Wrong credentials!");
      }
      const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      PRIVATE_KEY,
      { expiresIn: "1d" }
      );
      res.status(200).json({ accessToken,role: user.role });
    } catch (err) {
      res.status(500).json(err);
    }
  });
  router.get("/",verifyToken, async (req, res) => {
    try {
      const userId = res.user.id;
      const orders = await User.find({_id:userId});
      res.status(200).json(orders);

    } catch (err) {
      res.status(500).json(err);
    }





  });



  module.exports = router;