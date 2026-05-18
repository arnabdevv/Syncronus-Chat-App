import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  searchContacts,
  getDMContacts,
  getLastSeen,
} from "../controllers/ContactsController.js";
import { validate } from "../middlewares/validate.js";
import { searchContactsSchema } from "../validators/contactSchemas.js";

const contactsRoutes = Router();

contactsRoutes.post(
  "/search",
  verifyToken,
  validate(searchContactsSchema),
  searchContacts,
);
contactsRoutes.get("/dm-contacts", verifyToken, getDMContacts);
contactsRoutes.get("/last-seen/:userId", verifyToken, getLastSeen);

export default contactsRoutes;
