// userDto.ts
export class CreateUserDTO {
  role: "user" | "careUser" | "admin";
  email: string;
  password: string;
  region: string;
  subRegion: string;
  name: string;
  gender: "남자" | "여자";
  age: "20대" | "30대" | "40대" | "50대" | "60대";
  phoneNumber: string;

  constructor(
    role: "user" | "careUser" | "admin",
    email: string,
    password: string,
    region: string,
    subRegion: string,
    name: string,
    gender: "남자" | "여자",
    age: "20대" | "30대" | "40대" | "50대" | "60대",
    phoneNumber: string,
  ) {
    this.role = role;
    this.email = email;
    this.password = password;
    this.region = region;
    this.subRegion = subRegion;
    this.name = name;
    this.gender = gender;
    this.age = age;
    this.phoneNumber = phoneNumber;
  }
}

export class UpdateUserDTO {
  password: string;
  newPassword?: string;
  region: string;
  subRegion: string;
  name: string;
  gender: "남자" | "여자";
  age: "20대" | "30대" | "40대" | "50대" | "60대";
  phoneNumber: string;
  profileUrl: string;
  introduction: string;

  constructor(
    password: string,
    newPassword: string | null,
    region: string,
    subRegion: string,
    name: string,
    gender: "남자" | "여자",
    age: "20대" | "30대" | "40대" | "50대" | "60대",
    phoneNumber: string,
    profileUrl: string,
    introduction: string,
  ) {
    this.password = password;
    this.newPassword = newPassword;
    this.region = region;
    this.subRegion = subRegion;
    this.name = name;
    this.gender = gender;
    this.age = age;
    this.phoneNumber = phoneNumber;
    this.profileUrl = profileUrl;
    this.introduction = introduction;
  }
}
