import {
    IsDefined,
    IsOptional,
    IsString,
    MinLength,
  } from "class-validator";
  
  export class CreateBookDTO {
    @IsDefined()
    @IsString()
    @MinLength(3, { message: "En az 3 simvol olmalidir" })
    title: string;
  
    @IsDefined()
    @IsString()
    @MinLength(3, { message: "En az 3 simvol olmalidir" })
    description: string;
  }
  
  export class UpdateBookDTO {
    @IsOptional()
    @IsString()
    @MinLength(3, { message: "En az 3 simvol olmalidir" })
    title: string;
  
    @IsOptional()
    @IsString()
    @MinLength(3, { message: "En az 3 simvol olmalidir" })
    description: string;
  }
  