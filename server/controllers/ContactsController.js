import User from "../models/UserModel.js";

export const searchContacts = async (request, response, next) => {
  try {
    const { searchTerm } = request.body;

    if (searchTerm === undefined || searchTerm === null) {
      return response.status(400).send("searchTerm is Required.");
    }

    // Escape special characters for regex
    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // Create a case-insensitive regex for search
    const regex = new RegExp(sanitizedSearchTerm, "i");

    // Find contacts excluding the requesting user
    const contacts = await User.find({
      $and: [
        { _id: { $ne: request.userId } }, // Exclude the current user
        {
          $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
        },
      ],
    });

    return response.status(200).json({ contacts });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};
