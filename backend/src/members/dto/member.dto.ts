import { IsEmail, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ example: 'an@example.com', description: 'Email của thành viên được mời' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 'role-group-uuid-1', description: 'ID của nhóm quyền RBAC được gán' })
  @IsNotEmpty({ message: 'Vui lòng chọn nhóm phân quyền' })
  roleGroupId: string;
}

export class UpdateMemberDto {
  @ApiProperty({ example: 'role-group-uuid-1', description: 'ID nhóm quyền RBAC mới' })
  @IsNotEmpty({ message: 'Vui lòng chọn nhóm phân quyền' })
  roleGroupId: string;

  @ApiProperty({
    example: ['cost', 'reports'],
    description: 'Danh sách các quyền riêng lẻ bổ sung (extra permissions)',
  })
  @IsArray({ message: 'extraPermissions phải là một danh sách chuỗi' })
  extraPermissions: string[];
}

export class CreateRoleGroupDto {
  @ApiProperty({ example: 'Tech Lead', description: 'Tên nhóm quyền mới' })
  @IsNotEmpty({ message: 'Tên nhóm phân quyền không được để trống' })
  name: string;

  @ApiProperty({
    example: ['board', 'backlog', 'timeline', 'cost', 'reports'],
    description: 'Danh sách các tab / tính năng được cấp quyền',
  })
  @IsArray({ message: 'permissions phải là danh sách tab được cấp quyền' })
  permissions: string[];
}

export class UpdateRoleGroupPermissionsDto {
  @ApiProperty({
    example: ['board', 'backlog', 'timeline', 'reports'],
    description: 'Danh sách quyền mới của nhóm quyền',
  })
  @IsArray({ message: 'permissions phải là danh sách tab được cấp quyền' })
  permissions: string[];
}
