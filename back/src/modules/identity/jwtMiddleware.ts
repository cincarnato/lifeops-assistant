import type {onRequestHookHandler} from 'fastify';
import {jwtMiddleware as draxJwtMiddleware} from '@drax/identity-back';

const jwtMiddleware: onRequestHookHandler = (request, reply, done) => {
    // Google credentials authenticate this public endpoint independently of an existing session.
    if (request.method === 'POST' && request.url.split('?')[0] === '/api/google/login') {
        done();
        return;
    }
    draxJwtMiddleware(request, reply, done);
};

export default jwtMiddleware;
