import {OAuth2Client} from 'google-auth-library';
import {BadCredentialsError} from '@drax/identity-back';


class GoogleAuthService {


    async validateToken(token: string): Promise<any> {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new Error('GOOGLE_CLIENT_ID must be configured for Google login');
        }
        const client = new OAuth2Client();
        let ticket;
        try {
            ticket = await client.verifyIdToken({idToken: token, audience: clientId});
        } catch {
            throw new BadCredentialsError();
        }
        const payload = ticket.getPayload();
        if (!payload?.email || payload.email_verified !== true) {
            throw new BadCredentialsError();
        }
        return payload;
    }
}

export default GoogleAuthService;
export {GoogleAuthService}
