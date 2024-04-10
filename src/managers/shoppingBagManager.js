const ShoppingBag = require("../models/ShoppingBag");
const Size = require("../models/Size");
const { DEFAULT_MIN_QUANTITY } = require("../constants/shoppingBag");
const Jewelry = require("../models/Jewelry");

exports.createOrUpdate = async ({
  userId,
  jewelryId,
  sizeId: size,
  quantity: DEFAULT_ADD_QUANTITY,
}) => {
  const jewelry = await Jewelry.findById(jewelryId);
  oldJewelryQuantity = Number(jewelry.quantity);
  newJewelryQuantity = oldJewelryQuantity - DEFAULT_ADD_QUANTITY;
  await jewelry.updateOne({ quantity: newJewelryQuantity });

  let bagItem = await ShoppingBag.findOne({
    userId: userId,
    jewelryId: jewelryId,
    sizeId: size,
  });

  if (!bagItem) {
    bagItem = await ShoppingBag.create({
      userId,
      jewelryId,
      sizeId: size,
      quantity: DEFAULT_ADD_QUANTITY,
    });
  } else {
    newQuantity = Number(bagItem.quantity) + DEFAULT_ADD_QUANTITY;
    await bagItem.updateOne({ quantity: newQuantity });
  }

  return bagItem;
};

exports.getAll = async (userId) => {
  const result = await ShoppingBag.find({ userId });

  const jewelries = {};
  for (let i = 0; i < result.length; i++) {
    const jewelryId = result[i].jewelryId.toString();
    const bagItemId = result[i]._id;
    const jewelry = await Jewelry.findById(jewelryId)
      .populate("category")
      .populate("metals")
      .populate("stones.kind")
      .populate("stones.color")
      .populate("stones.caratWeight")
      .lean();
    const sizeId = result[i].sizeId;
    const size = await Size.findById(sizeId).populate("measurement").lean();
    const quantity = result[i].quantity;
    const maxQuantity = jewelry.quantity + quantity;
    jewelries[bagItemId] = {
      jewelry: jewelry,
      size: size,
      quantity: quantity,
      maxQuantity: maxQuantity,
      minQuantity: DEFAULT_MIN_QUANTITY,
    };
  }

  return jewelries;
};

exports.updateQuantity = async (userId, jewelryId, sizeId, updatedQuantity) => {
  const bagItem = await ShoppingBag.findOne({
    userId: userId,
    jewelryId: jewelryId,
    sizeId: sizeId,
  });

  const jewelry = await Jewelry.findById(jewelryId);

  alreadyAddedQuantity = bagItem.quantity;

  availableQuantity = jewelry.quantity + alreadyAddedQuantity;

  if (updatedQuantity < DEFAULT_MIN_QUANTITY) {
    throw new Error("Quantity must be greater than zero");
  } else if (updatedQuantity > availableQuantity) {
    throw new Error(
      `Please choose quantity between ${DEFAULT_MIN_QUANTITY} and ${availableQuantity}`
    );
  } else {
    await bagItem.updateOne({ quantity: updatedQuantity });

    if (alreadyAddedQuantity < updatedQuantity) {
      difference = updatedQuantity - alreadyAddedQuantity;
      newQuantity = jewelry.quantity - difference;
    } else {
      difference = alreadyAddedQuantity - updatedQuantity;
      newQuantity = jewelry.quantity + difference;

      if (Number(updatedQuantity) === 0) {
        await bagItem.deleteOne();
      }
      await jewelry.updateOne({ quantity: newQuantity });
    }
  }
};
