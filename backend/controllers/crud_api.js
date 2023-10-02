const Apparel = require("../models/apparel_model")
const mongoose = require('mongoose')



// get all apparels

const getAllApparels = async(req, res) => {
    try{
        const allApparel = await Apparel.find();
        res.json(allApparel);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

// get a single apparel

const getASingleApparel = async(req, res) => {
    try{
        const apparel = await Apparel.findOne({apparelID: req.params.id}); // using findOne function to get the object associated with apparel id 
        if (!apparel){
            return res.status(404).json({error: 'Apparel Not found.'});
        }
        res.json(apparel);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}


// create a apparel

const createApparel = async (req, res) => {
    try{
        const newApparel = new Apparel(req.body);
        const savedApparel = await newApparel.save();
        res.status(201).json(savedApparel);
    } catch (err) {
        res.status(400).json({'error': err.message});
    }
}

// delete a apparel

const deleteApparel = async(req, res) => {
    try{
        const deletedApparel = await Apparel.findOneAndDelete({apparelID: req.params.id});
        if (!deletedApparel){
            return res.status(404).json({error: "Apparel not found."});
        }
        res.json(deletedApparel);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}

// update a apparel

const updateApparel = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedApparel = await Apparel.findOneAndUpdate(
            { apparelID: id },
            {
                ...req.body
            }
        );
        if (!updatedApparel) {
            return res.status(404).json({ error: 'Apparel not found' });
        }
        res.status(200).json(updatedApparel); // Send a JSON response with status 200
    } catch (err) {
        console.error('Error updating apparel:', err); // Log any errors
        res.status(500).json({ error: err.message });
    }
}




module.exports = {
    getAllApparels, getASingleApparel, createApparel, updateApparel, deleteApparel
}