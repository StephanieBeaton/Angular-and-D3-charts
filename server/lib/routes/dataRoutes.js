'use strict';
const express = require('express');
const dataRouter = module.exports = exports = new express.Router();
dataRouter.get('/content/', function(req, res) {
    return res.status(200).json({"Data":"data"});
});
