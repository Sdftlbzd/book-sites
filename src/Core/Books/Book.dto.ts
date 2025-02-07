import {
    IsDefined,
    IsNumber,
    IsOptional,
    IsString,
    MinLength,
  } from "class-validator";
import { User } from "../../DAL/models/User.model";
  
  export class CreateBookDTO {
    @IsDefined()
    @IsString()
    @MinLength(3, { message: "En az 3 simvol olmalidir" })
    title: string;
  
    @IsDefined()
    @IsString()
    @MinLength(3, { message: "En az 3 simvol olmalidir" })
    description: string;

    @IsDefined()
    @IsNumber()
    payMount: number;

    @IsDefined()
    @IsString()
    currency: string;

    @IsDefined()
    authors:User[];
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

    @IsOptional()
    @IsNumber()
    payMount: number;

    @IsOptional()
    @IsString()
    currency: string;

    @IsOptional()
    @IsNumber()
    saleCount: number;
  }
  