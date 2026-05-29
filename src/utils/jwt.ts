import jwt from 'jsonwebtoken';


export function signJwt(payload: object, secret: string, options?: jwt.SignOptions): string {
    return jwt.sign(payload, secret, options);
}
export function verifyJwt(token: string, secret: string, options?: jwt.VerifyOptions): object | string {
    return jwt.verify(token, secret, options);
}
