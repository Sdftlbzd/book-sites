import {
    IsDefined,
    IsEmail,
    IsString,
    MaxLength,
    MinLength,
  } from "class-validator";
  
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
  }
  