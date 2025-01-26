import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../../services/authService";
import { RegisterForm, AuthResult, LoginForm } from "../../types/auth";
import { LocalisationService } from "../../services/localisationService";

export class AuthController {
    private app: FastifyInstance;
    private authService: AuthService;
    private localisationService: LocalisationService

    constructor(app: FastifyInstance) {
        this.app = app;
        this.authService = new AuthService(app);
        this.localisationService = new LocalisationService(app);
    }

    async login(request: FastifyRequest, reply: FastifyReply) {
        const form = request.body as LoginForm;
        try {
            const result: AuthResult = await this.authService.login(form);

            return await reply.setCookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
                sameSite: 'none'
            }).setCookie('accessToken', result.accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: 60 * 60,
                path: '/',
                sameSite: 'none'
            }).send({
                user: result.user,
            });
        } catch (error: Error | any) {
            reply.status(401).send({ error: error.message });
        }
    }
    async register(request: FastifyRequest, reply: FastifyReply) {
        const form = request.body as RegisterForm;
        try {
            const result: AuthResult = await this.authService.register(form);

            return await reply.setCookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
                sameSite: 'none'
            }).setCookie('accessToken', result.accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: 60 * 60,
                path: '/',
                sameSite: 'none'
            }).send({
                user: result.user,
            });
        } catch (error: Error | any) {
            return reply.status(400).send({error: error.message});
        }
    }

    async logout(request: FastifyRequest, reply: FastifyReply) {
        try {
            return await reply
                .clearCookie("refreshToken")
                .clearCookie("accessToken")
                .send({
                    message: "Cleared authentication tokens.",
                });
        } catch (error: Error | any) {
            return await reply
                .status(400)
                .send({ error: "Couldn't logout user." });
        }
    }

    async verifyEmail(
        request: FastifyRequest<{ Querystring: { code: string } }>,
        reply: FastifyReply
    ) {
        try {
            if (!request.query.code) {
                return await reply.status(400).send({
                    error: "No verification code provided in query params. (should be: /verify-email?code=<token>)",
                });
            }

            await this.authService.verifyEmail(request.query.code);

            return await reply.send({
                status: "ok",
                message: "Email verified.",
            });
        } catch (error) {
            return await reply
                .status(400)
                .send({ error: "Couldn't verify email." });
        }
    }
    async updateLocation(
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        try {
            const { lat, lon } = request.body as { lat: number, lon: number };

            await this.localisationService.updateUserLocation(request.user.id, request.ip, lat, lon)

            return await reply.send({
                status: "ok",
                message: "Updated location",
            });
        } catch (error) {
            return await reply
                .status(400)
                .send({ error: "Couldn't update location." });
        }
    }
}
