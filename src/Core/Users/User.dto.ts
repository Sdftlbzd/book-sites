import {
  IsDefined,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Book } from "../../DAL/models/Book.model";
import { UserBookPurchase } from "../../DAL/models/Order.model";

export class CreateUserDTO {
  @IsDefined({ message: "Name is required" })
  @IsString()
  @MaxLength(25, { message: "Name is too long" })
  @MinLength(3, { message: "En az 3 simvol olmalidir" })
  name: string;

  @IsDefined()
  @IsString()
  @MaxLength(50)
  surname: string;

  @IsDefined()
  @IsEmail({}, { message: "Email düzgün formatda olmalıdır." })
  email: string;

  @IsDefined()
  @IsString()
  @MaxLength(15)
  @MinLength(8)
  password: string;
  
  @IsDefined()
  @IsString()
  role: string;

  @IsDefined()
  @IsString()
  about: string;
}

export class EditUserDTO {
  @IsOptional()
  @IsString()
  @MaxLength(25, { message: "Name is too long" })
  @MinLength(3, { message: "En az 3 simvol olmalidir" })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  surname: string;

  @IsOptional()
  @IsEmail({}, { message: "Email düzgün formatda olmalıdır." })
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  about: string;

  @IsOptional()
  @IsNumber()
  bookCount:number;

  @IsOptional()
  purchases: UserBookPurchase[]; 
}
