import User from "../models/users";
import Role from "../models/roles";
import jwt from "jsonwebtoken";
export const signUp = async (req, res) => {
    const { email, password, fullName, roles } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ message: "Ese correo ya esta registrado" });
    const newUser = new User({ email, password: await User.encryptPassword(password), fullName });
    if (roles) {
        const foundRoles = await Role.find({ name: { $in: roles } });
        newUser.roles = foundRoles.map(role => role._id);
    } else {
        const role = await Role.findOne({ name: "User" });
        newUser.roles = [role._id];
    }
    const savedUser = await newUser.save();
    const token = jwt.sign({ id: savedUser._id }, process.env.TOKEN_SECRET, { expiresIn: 86400 });
    res.json({ token });
}
export const login = async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    //const existingUser = await User.findOne({ email }).populate("roles");
    if (!existingUser) return res.status(400).json({ message: "Ese correo electrónico no está registrado" });
    const matchedPassword = await User.verifyPassword(password, existingUser.password);
    if (!matchedPassword) return res.status(401).json({ message: "Verifíque el correo o la contraseña" });
    const token = jwt.sign({ id: existingUser._id }, process.env.TOKEN_SECRET, { expiresIn: 86400 });
    res.json({ token });
}
export const changePassword = (req, res) => {
    const { password, rePassword, newPassword } = req.body;
}
export const forgotPassword = (req, res) => { }