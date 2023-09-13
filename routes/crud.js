const express = require("express")

const {
    getAllApparels,
    getASingleApparel, 
    createApparel,
    updateApparel,
    deleteApparel
} = require("../controllers/crud_api")


const router = express.Router()


// get a specific apparel
router.get('/:id', getASingleApparel)

// get all apparels
router.get('/', getAllApparels)

// create a apparel
router.post('/', createApparel)

// update a apparel
router.patch('/:id', updateApparel);


// delete a apparel
router.delete('/:id', deleteApparel)


module.exports = router