var express = require("express");
var router = express.Router();

var buttonsCTRL = require( "../CONTROLLERS/buttonsCTRL.js" );

router.get( '/0/' , buttonsCTRL.press0 );
router.get( '/1/' , buttonsCTRL.press1 );
router.get( '/2/' , buttonsCTRL.press2 );
router.get( '/3/' , buttonsCTRL.press3 );
router.get( '/4/' , buttonsCTRL.press4 );
router.get( '/5/' , buttonsCTRL.press5 );
router.get( '/6/' , buttonsCTRL.press6 );
router.get( '/7/' , buttonsCTRL.press7 );
router.get( '/8/' , buttonsCTRL.press8 );
router.get( '/9/' , buttonsCTRL.press9 );
router.get( '/10/' , buttonsCTRL.press10 );
router.get( '/11/' , buttonsCTRL.press11 );
router.get( '/12/' , buttonsCTRL.press12 );
router.get( '/13/' , buttonsCTRL.press13 );
router.get( '/14/' , buttonsCTRL.press14 );
router.get( '/15/' , buttonsCTRL.press15 );
router.get( '/16/' , buttonsCTRL.press16 );
router.get( '/17/' , buttonsCTRL.press17 );
router.get( '/18/' , buttonsCTRL.press18 );
router.get( '/19/' , buttonsCTRL.press19 );
router.get( '/20/' , buttonsCTRL.press20 );

module.exports = router;