import Joi from "joi";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { appConfig, userRoleList } from "../../consts";
import { User } from "../../DAL/models/User.model";
import { validate } from "class-validator";
import { transporter } from "../../helpers";
import { CreateUserByAdminDTO, EditUserByAdminDTO } from "./Admin.dto";

const userCreate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, surname, email, password, role, status } = req.body;

    if (role && !userRoleList.includes(role)) {
        const error = new Error(`Invalid role! Allowed roles: ${userRoleList}`);
        throw error;
      }

    const user = await User.findOne({ where: { email: email } });
    if (user) return next(res.json("Bu emaile uygun user artiq movcuddur"));

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
      return next(
        res.status(400).json({
          message: "Validation failed",
          errors: errors.reduce((response: any, item: any) => {
            response[item.property] = Object.keys(item.constraints);
            return response;
          }, {}),
        })
      );
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
        return next(("Error sending email"))
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
      message: "An error occurred while creating the user",
      error: error instanceof Error ? error.message : error,
    });
  }
};

const userEdit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, status } = req.body;
    const id = Number(req.params.id);

    const user = await User.findOne({
        where:{ id },
        select: [
            "id",
            "name",
            "surname",
            "email",
            "role",
            "status",
            "created_at",
          ],
    })

    if(!user) return next(res.json("Bele bir user movcud deyil"))

    if (role && !userRoleList.includes(role)) {
      const error = new Error(`Invalid role! Allowed roles: ${userRoleList}`);
      throw error;
    }

    if(!status && !role){
       return next(res.json("Hech bir deyishiklik yoxdur"))
    }

    if((user.status === (status|| undefined))||(user.role === (role|| undefined))){
        return next(res.json("Hech bir deyishiklik yoxdur"))
    }

    const dto = new EditUserByAdminDTO();
    dto.role = role;
    dto.status = status;

    const errors = await validate(dto);

    if (errors.length > 0) {
      return next(
        res.status(400).json({
          message: "Validation failed",
          errors: errors.reduce((response: any, item: any) => {
            response[item.property] = Object.keys(item.constraints);
            return response;
          }, {}),
        })
      );
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
        "updated_at"
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
      message: "An error occurred while creating the user",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// const userDelete = async (req, res) => {
//   try {
//     await User.deleteOne({ _id: req.params.id });

//     return res.json({ message: "User uğurla silindi!" });
//   } catch (err) {
//     return res.status(500).json({ message: error[500], error: err.message });
//   }
// };

// const adminList = async (req, res) => {
//   try {
//     const admins = await User.find({ role: "admin" });

//     if (!admins.length) {
//       return res.status(404).json({
//         message: "No admins found.",
//       });
//     }

//     const page = req.query.page || 1;
//     const limit = req.query.perpage || 5;

//     const before_page = (page - 1) * limit;
//     const list = await User.find({ role: "admin" })
//       .skip(before_page)
//       .limit(limit);

//     res.status(200).json({
//       data: list,
//       pagination: {
//         admins,
//         currentpage: page,
//         messagesCount: list.length,
//         allPages: Math.ceil(admins / limit),
//       },
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: error[500],
//       error: err.message,
//     });
//   }
// };

// const RoleList = async (req, res) => {
//   res.json(userRoleList);
// };

export const AdminController = () => ({
  userCreate,
    userEdit,
  //   userDelete,
  //   adminList,
  //   RoleList,
});
