const express = require('express');
const router = express.Router();
const Appliance = require('../models/Appliance');

// Middleware optional auth
const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      req.user = null;
    }
  }
  
  next();
};

// GET: Ambil semua appliances
router.get('/', optionalAuth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user) {
      query.userId = req.user.id;
    }
    
    const appliances = await Appliance.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: appliances
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appliances',
      error: error.message
    });
  }
});

// GET: Ambil satu appliance by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    if (req.user) {
      query.userId = req.user.id;
    }
    
    const appliance = await Appliance.findOne(query);
    
    if (!appliance) {
      return res.status(404).json({
        success: false,
        message: 'Appliance not found'
      });
    }
    
    res.json({
      success: true,
      data: appliance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appliance',
      error: error.message
    });
  }
});

// POST: Tambah appliance baru
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, wattage, hoursPerDay, category } = req.body;
    
    const applianceData = {
      name,
      wattage,
      hoursPerDay,
      category
    };
    
    if (req.user) {
      applianceData.userId = req.user.id;
    }
    
    const appliance = new Appliance(applianceData);
    await appliance.save();
    
    res.status(201).json({
      success: true,
      message: 'Appliance added successfully',
      data: appliance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error adding appliance',
      error: error.message
    });
  }
});

// PUT: Update appliance
router.put('/:id', optionalAuth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    if (req.user) {
      query.userId = req.user.id;
    }
    
    const appliance = await Appliance.findOneAndUpdate(
      query,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!appliance) {
      return res.status(404).json({
        success: false,
        message: 'Appliance not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Appliance updated successfully',
      data: appliance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating appliance',
      error: error.message
    });
  }
});

// DELETE: Hapus appliance
router.delete('/:id', optionalAuth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    if (req.user) {
      query.userId = req.user.id;
    }
    
    const appliance = await Appliance.findOneAndDelete(query);
    
    if (!appliance) {
      return res.status(404).json({
        success: false,
        message: 'Appliance not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Appliance deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting appliance',
      error: error.message
    });
  }
});

module.exports = router;