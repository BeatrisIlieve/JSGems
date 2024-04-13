const router = require("express").Router();
const { isAuth } = require("../middlewares/authMiddleware");
const { extractErrorMessages } = require("../utils/errorHelpers");
const completeTransactionManager = require("../managers/completeTransactionManager");

router.get("/", isAuth, async (req, res) => {
    try {
        res.render("orders/completeTransaction");

    } catch(err) {
        const errorMessages = extractErrorMessages(err);
  
        res.status(404).render("orders/completeTransaction", { errorMessages });
    }
});

router.post("/", isAuth, async(req, res) => {
    const userId = req.user._id;

    cardData = req.body;

    try {
        await completeTransactionManager.verifyCardDetails(cardData);

        res.redirect("/");

    } catch(err) {
        const errorMessages = extractErrorMessages(err);
  
        res.status(404).render("orders/completeTransaction", { errorMessages});
    }
});

module.exports = router;