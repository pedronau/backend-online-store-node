import { bcryptAdapter, envs, Jwt } from "../../config";
import { UserModel } from "../../data";
import {
  CustomError,
  RegisterUserDto,
  UserEntity,
  LoginUserDto,
} from "../../domain";
import { EmailService } from "./email.service";

export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  public async registerUser(registerUserDto: RegisterUserDto) {
    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if (existUser) throw CustomError.badRequest("Email already exist");

    try {
      const user = new UserModel(registerUserDto);

      // Encriptar la contraseña
      user.password = bcryptAdapter.hash(registerUserDto.password);
      await user.save();

      // Generar un JWT para mantener la autenticación del usuario

      const token = await Jwt.generateToken({
        id: user.id,
      });
      if (!token) throw CustomError.internalServer("Error while creating JWT");

      // Email de confirmación
      await this.sendEmailValidationLink(user.email);

      const { password, ...userEntity } = UserEntity.fromObject(user);

      return { user: userEntity, token: token };
    } catch (error) {
      throw CustomError.internalServer(`${error}`);
    }
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    //1º Verificar si existe el usuario mediante el email
    const existUser = await UserModel.findOne({ email: loginUserDto.email });
    if (!existUser) throw CustomError.badRequest("Email not found");

    //2º Ver si los hashes de las contraseñas coinciden ismathc bcrypt compare (modelo de mongoose)

    const passMatches = bcryptAdapter.compare(
      loginUserDto.password,
      existUser.password
    );

    if (passMatches) {
      const { password, ...userEntity } = UserEntity.fromObject(existUser);

      const token = await Jwt.generateToken({
        id: existUser.id,
        email: existUser.email,
      });
      if (!token) throw CustomError.internalServer("Error while creating JWT");

      return {
        user: userEntity,
        token: token,
      };
    } else {
      throw CustomError.badRequest("Incorrect password");
    }
  }

  public async validateEmail(token: string) {
    const payload = await Jwt.validateToken(token);
    if (!payload) throw CustomError.unauthorized("Invalid token");

    const { email } = payload as { email: string };
    if (!email) throw CustomError.internalServer("Email not in token");

    const user = await UserModel.findOne({ email });
    if (!user)
      throw CustomError.internalServer("Email in token not exists in database");

    user.emailValidated = true;
    await user.save();
    return true;
  }

  private sendEmailValidationLink = async (email: string) => {
    const token = await Jwt.generateToken({ email });
    if (!token) throw CustomError.internalServer("Error generating token");

    const link = `${envs.WEB_SERVICE_URL}/auth/validate-email/${token}`;
    const html = `
    <h1>Validate your email</h1>
    <p>Click on the following link to validate your email</p>
    <a href="${link}">Validate your email: ${email}</a>
    `;

    const options = {
      to: email,
      subject: "Validate your email",
      htmlBody: html,
    };

    const isSent = await this.emailService.sendEmail(options);
    if (!isSent) throw CustomError.internalServer("Error sending email");
  };
}
