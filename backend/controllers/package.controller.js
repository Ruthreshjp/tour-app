import Package from "../models/package.model.js";
import dotenv from "dotenv";

dotenv.config();

// Create package
export const createPackage = async (req, res) => {
  try {
    const {
      packageName,
      packageDescription,
      packageDestination,
      packageDays,
      packageNights,
      packageAccommodation,
      packageTransportation,
      packageMeals,
      packageActivities,
      packagePrice,
      packageDiscountPrice,
      packageOffer,
    } = req.body;

    const imageFilenames = req.files ? req.files.map((file) => file.filename) : [];

    // Validation
    if (
      !packageName ||
      !packageDescription ||
      !packageDestination ||
      !packageAccommodation ||
      !packageTransportation ||
      !packageMeals ||
      !packageActivities ||
      packageOffer === undefined // Check if packageOffer is provided
    ) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }
    if (parseFloat(packagePrice) < parseFloat(packageDiscountPrice)) {
      return res.status(400).send({
        success: false,
        message: "Regular price should be greater than discount price!",
      });
    }
    if (parseFloat(packagePrice) <= 0 || parseFloat(packageDiscountPrice) < 0) {
      return res.status(400).send({
        success: false,
        message: "Price should be greater than 0!",
      });
    }
    if (parseInt(packageDays) <= 0 || parseInt(packageNights) <= 0) {
      return res.status(400).send({
        success: false,
        message: "Days and nights must be greater than 0!",
      });
    }

    const newPackage = await Package.create({
      packageName,
      packageDescription,
      packageDestination,
      packageDays: parseInt(packageDays),
      packageNights: parseInt(packageNights),
      packageAccommodation,
      packageTransportation,
      packageMeals,
      packageActivities,
      packagePrice: parseFloat(packagePrice),
      packageDiscountPrice: parseFloat(packageDiscountPrice),
      packageOffer: packageOffer === "true" || packageOffer === true, // Handle string/boolean
      packageImages: imageFilenames,
    });

    return res.status(201).send({
      success: true,
      message: "Package created successfully",
      package: newPackage,
    });
  } catch (error) {
    console.error("Create package error:", error);
    return res.status(500).send({
      success: false,
      message: "Error creating package",
      error: error.message,
    });
  }
};

// Update package
export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      packageName,
      packageDescription,
      packageDestination,
      packageDays,
      packageNights,
      packageAccommodation,
      packageTransportation,
      packageMeals,
      packageActivities,
      packagePrice,
      packageDiscountPrice,
      packageOffer,
    } = req.body;

    const imageFilenames = req.files ? req.files.map((file) => file.filename) : [];

    const packageToUpdate = await Package.findById(id);
    if (!packageToUpdate) {
      return res.status(404).send({
        success: false,
        message: "Package not found",
      });
    }

    // Validation
    if (
      packageName === "" ||
      packageDescription === "" ||
      packageDestination === "" ||
      packageAccommodation === "" ||
      packageTransportation === "" ||
      packageMeals === "" ||
      packageActivities === "" ||
      packageOffer === undefined
    ) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }
    if (parseFloat(packagePrice) < parseFloat(packageDiscountPrice)) {
      return res.status(400).send({
        success: false,
        message: "Regular price should be greater than discount price!",
      });
    }
    if (parseFloat(packagePrice) <= 0 || parseFloat(packageDiscountPrice) < 0) {
      return res.status(400).send({
        success: false,
        message: "Price should be greater than 0!",
      });
    }
    if (parseInt(packageDays) <= 0 || parseInt(packageNights) <= 0) {
      return res.status(400).send({
        success: false,
        message: "Days and nights must be greater than 0!",
      });
    }

    // Update fields
    packageToUpdate.packageName = packageName || packageToUpdate.packageName;
    packageToUpdate.packageDescription =
      packageDescription || packageToUpdate.packageDescription;
    packageToUpdate.packageDestination =
      packageDestination || packageToUpdate.packageDestination;
    packageToUpdate.packageDays = parseInt(packageDays) || packageToUpdate.packageDays;
    packageToUpdate.packageNights = parseInt(packageNights) || packageToUpdate.packageNights;
    packageToUpdate.packageAccommodation =
      packageAccommodation || packageToUpdate.packageAccommodation;
    packageToUpdate.packageTransportation =
      packageTransportation || packageToUpdate.packageTransportation;
    packageToUpdate.packageMeals = packageMeals || packageToUpdate.packageMeals;
    packageToUpdate.packageActivities =
      packageActivities || packageToUpdate.packageActivities;
    packageToUpdate.packagePrice = parseFloat(packagePrice) || packageToUpdate.packagePrice;
    packageToUpdate.packageDiscountPrice =
      parseFloat(packageDiscountPrice) || packageToUpdate.packageDiscountPrice;
    packageToUpdate.packageOffer =
      packageOffer === "true" || packageOffer === true || packageToUpdate.packageOffer;

    if (imageFilenames.length > 0) {
      packageToUpdate.packageImages = imageFilenames;
    }

    await packageToUpdate.save();

    return res.status(200).send({
      success: true,
      message: "Package updated successfully",
      package: packageToUpdate,
    });
  } catch (error) {
    console.error("Update package error:", error);
    return res.status(500).send({
      success: false,
      message: "Error updating package",
      error: error.message,
    });
  }
};

// Get all packages
export const getPackages = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let offer = req.query.offer;
    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }

    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    const packages = await Package.find({
      $or: [
        { packageName: { $regex: searchTerm, $options: "i" } },
        { packageDestination: { $regex: searchTerm, $options: "i" } },
      ],
      packageOffer: offer,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).send({
      success: true,
      packages,
    });
  } catch (error) {
    console.error("Get packages error:", error);
    return res.status(500).send({
      success: false,
      message: "Error fetching packages",
      error: error.message,
    });
  }
};

// Get package data
export const getPackageData = async (req, res) => {
  try {
    const packageData = await Package.findById(req?.params?.id);
    if (!packageData) {
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });
    }
    return res.status(200).send({
      success: true,
      packageData,
    });
  } catch (error) {
    console.error("Get package data error:", error);
    return res.status(500).send({
      success: false,
      message: "Error fetching package data",
      error: error.message,
    });
  }
};

// Delete package
export const deletePackage = async (req, res) => {
  try {
    const deletePackage = await Package.findByIdAndDelete(req?.params?.id);
    if (!deletePackage) {
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });
    }
    return res.status(200).send({
      success: true,
      message: "Package deleted successfully!",
    });
  } catch (error) {
    console.error("Delete package error:", error);
    return res.status(500).send({
      success: false,
      message: "Error deleting package",
      error: error.message,
    });
  }
};