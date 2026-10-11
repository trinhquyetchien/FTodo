import { IsEmail, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class AddMemberDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Vui lòng chọn nhóm phân quyền' })
  roleGroupId: string;
}

export class UpdateMemberDto {
  @IsNotEmpty({ message: 'Vui lòng chọn nhóm phân quyền' })
  roleGroupId: string;

  @IsArray({ message: 'extraPermissions phải là một danh sách chuỗi' })
  extraPermissions: string[];
}

export class CreateRoleGroupDto {
  @IsNotEmpty({ message: 'Tên nhóm phân quyền không được để trống' })
  name: string;

  @IsArray({ message: 'permissions phải là danh sách tab được cấp quyền' })
  permissions: string[];
}

export class UpdateRoleGroupPermissionsDto {
  @IsArray({ message: 'permissions phải là danh sách tab được cấp quyền' })
  permissions: string[];
}
