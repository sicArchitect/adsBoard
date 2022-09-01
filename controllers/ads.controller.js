const Ad = require('../models/ads.model');
const getImageFileType = require('../utils/getImageFileType');
const sanitize = require('mongo-sanitize');
const fs = require('fs');

exports.getAllAds = async (req, res) => {
  try {
    res.json(await Ad.find());
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Not found...' });
    }
    res.json(ad);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.getAdBySearch = async (req, res) => {
  try {
    const ad = await Ad.find({ title: { $regex: /req.params.searchPhrase/ } });
    if (!ad) {
      return res.status(404).json({ message: 'Not found...' });
    }
    res.json(ad);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.addAd = async (req, res) => {
  const { title, description, date, price, location, userName } = sanitize(
    req.body
  );
  const fileType = req.file ? await getImageFileType(req.file) : 'unknown';

  const isFile =
    req.file &&
    ['image/png', 'image/jpg', 'image/jpeg', 'image/git'].includes(fileType);

  const isDataValid =
    title && description && date && isFile && price && location && userName;

  try {
    if (isDataValid) {
      const newAd = new Ad({
        title: title,
        description: description,
        date: date,
        image: req.file.filename,
        price: price,
        location: location,
        userName: userName,
      });
      await newAd.save();
      res.json(newAd);
    } else {
      if (req.file) {
        fs.unlinkSync(`./public/uploads//${req.file.filename}`);
      }
      res.status(400).json({ message: 'Bad request' });
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.updateAdById = async (req, res) => {
  const { title, description, date, price, location, userName } = req.body;
  try {
    const ad = await Ad.findById(req.params.id);
    if (ad) {
      await Ad.updateOne(
        { _id: req.params.id },
        {
          $set: {
            title: title,
            description: description,
            date: date,
            image: req.file.filename,
            price: price,
            location: location,
            userName: userName,
          },
        }
      );
    } else {
      if (req.file) {
        fs.unlinkSync(`./public/uploads//${req.file.filename}`);
      }
      return res.status(404).json({ message: 'Not found...' });
    }
    await ad.save();
    res.json({ message: 'OK' });§
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

exports.removeAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (ad) {
      await Ad.deleteOne({ _id: req.params.id });
      res.json({ message: 'Ok' });
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};
