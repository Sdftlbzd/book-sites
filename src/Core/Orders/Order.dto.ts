import {
    IsDate,
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
import { User } from "../../DAL/models/User.model";

export class CreateOrderDTO {
    @IsDefined()
    user: User;

    @IsDefined()
    book: Book;

  @IsDate() // Satınalma tarixi
  purchaseDate: Date;
}


export class CreateAuthorDTO {
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
  @IsString()
  password: string;

  @IsOptional()
  @IsNumber()
  bookCount:number;

  @IsOptional()
  purchases: UserBookPurchase[]; 
}
