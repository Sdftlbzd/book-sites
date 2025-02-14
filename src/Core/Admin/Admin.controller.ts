import Joi from "joi";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { appConfig } from "../../consts";
import { ERoleType, User } from "../../DAL/models/User.model";
import { validate } from "class-validator";
import { transporter } from "../../helpers";
import { CreateUserByAdminDTO, EditUserByAdminDTO } from "./Admin.dto";
import { In } from "typeorm";
import { formatErrors } from "../../DAL/middlewares/error.middleware";

const userCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, surname, email, password, role, status } = req.body;

    if (role && !(role in ERoleType)) {
      const error = new Error(`Invalid role! Allowed roles: ${ERoleType}`);
      throw error;
    }

    const user = await User.findOne({ where: { email: email } });
    if (user) {
      res.json("Bu emaile uygun user artiq movcuddur");
      return;
    }

    const newPassword = await bcrypt.hash(password, 10);

    const dto = new CreateUserByAdminDTO();
    dto.name = name;
    dto.surname = surname;
    dto.email = email;
    dto.password = newPassword;
    dto.role = role;
    dto.status = status;

    const errors = await validate(dto);

    if (errors.length > 0) {
       res.status(400).json(formatErrors(errors));
      return;
    }

    const newUser = User.create({
      name,
      surname,
      email,
      password: newPassword,
      role,
    });
    await newUser.save();

    const mailOptions = {
      from: appConfig.EMAIL,
      to: email,
      subject: "Hello",
      html: `<h3>Created User</h3>
            <p>You have been created as a user</p>
            <p>You can see the changes below:</p>
            <ul>
              <li><strong>Name:</strong> ${newUser.name}</li>
              <li><strong>Surname:</strong> ${newUser.surname}</li>
              <li><strong>Email:</strong> ${newUser.email}</li>
              <li><strong>Role:</strong> ${newUser.role}</li>
            </ul>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.json("Error sending email");
        return;
      } else {
        console.log("Email sent: ", info);
      }
    });

    const data = await User.findOne({
      where: { email },
      select: [
        "id",
        "name",
        "surname",
        "email",
        "role",
        "status",
        "created_at",
      ],
    });

    res.status(201).json({ data });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const userEdit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, status } = req.body;
    const id = Number(req.params.id);

    const user = await User.findOne({
      where: { id },
      select: [
        "id",
        "name",
        "surname",
        "email",
        "role",
        "status",
        "created_at",
      ],
    });

    if (!user) {
      res.json("Bele bir user movcud deyil");
      return;
    }

    if (role && !(role in ERoleType)) {
      const error = new Error(`Invalid role! Allowed roles: ${ERoleType}`);
      throw error;
    }

    if (!status && !role) {
      res.json("Hech bir deyishiklik yoxdur");
      return;
    }

    if (
      user.status === (status || undefined) ||
      user.role === (role || undefined)
    ) {
      res.json("Hech bir deyishiklik yoxdur");
      return;
    }

    const dto = new EditUserByAdminDTO();
    dto.role = role;
    dto.status = status;

    const errors = await validate(dto);

    if (errors.length > 0) {
      res.status(400).json(formatErrors(errors));
      return;
    }
    await User.update(id, {
      role,
      status,
    });

    const updatedData = await User.findOne({
      where: { id },
      select: [
        "id",
        "name",
        "surname",
        "email",
        "status",
        "role",
        "created_at",
        "updated_at",
      ],
    });

    const mailOptions = {
      from: appConfig.EMAIL,
      to: user.email,
      subject: "Your Profile Has Been Updated",
      html: `<h3>Your Profile Updates</h3>
             <p>The following changes were made to your profile:</p>
             <ul>
             </ul>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email: ", error);
        return res.status(500).json({
          message: error.message,
          error,
        });
      } else {
        console.log("Email sent: ", info);
        return res.json({ message: "Check your email" });
      }
    });

    res.status(201).json({ updatedData });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const userDelete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleteUser = await User.findOne({
      where: { id: Number(req.params.id) },
    });

    if (!deleteUser) {
      res.json("Bele bir user yoxdur");
      return;
    }

    await User.softRemove(deleteUser);

    res.json({ message: "User uğurla silindi!" });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const adminList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.perpage) || 5;

    const before_page = (page - 1) * limit;
    const [list, total] = await User.findAndCount({
      where:{ role: ERoleType.ADMIN },
      skip: before_page,
      take: limit,
    });

if (list.length === 0) {
  res.status(404).json({
    message: "No admins found.",
  });
  return;
}
    res.status(200).json({
      data: list,
      pagination: {
        admins: total,
        currentPage: page,
        messagesCount: list.length,
        allPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const userList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.perpage) || 5;

    const before_page = (page - 1) * limit;
    const [ list, total] = await User.findAndCount({
      where: { role: In([ERoleType.AUTHOR, ERoleType.USER]) },
      skip: before_page,
      take: limit,
    });

    if (list.length === 0) {
      res.status(404).json({
        message: "No users found.",
      });
      return;
    }

    res.status(200).json({
      data: list,
      pagination: {
        users: total,
        currentPage: page,
        messagesCount: list.length,
        allPages: Math.ceil(Number(total) / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const RoleList = async (req: Request, res: Response, next: NextFunction) => {
  res.json(ERoleType);
};

export const AdminController = () => ({
  userCreate,
  userEdit,
  userDelete,
  adminList,
  userList,
  RoleList,
});
