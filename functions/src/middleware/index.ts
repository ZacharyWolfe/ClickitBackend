import * as admin from 'firebase-admin'
import { DecodedIdToken } from 'firebase-admin/auth'

const tokenValidation = async (
    request: any, 
    response: any
): Promise<DecodedIdToken | undefined> => {
    if ((!request.headers.authorization || !request.headers.authorization.startsWith('Bearer ')) && (request.cookies && !request.cookies.__session)) {
        response.status(403).send({ error: 'Unauthorized. Token is invalid.'})
        return
    }
    
    let token

    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
        token = request.headers.authorization.split('Bearer ')[1]
        response.status(200).send({ message: 'Authorized. Token is valid via header.'})
    }
    else if (request.cookies) {
        token = request.cookies.__session
        response.status(200).send({ message: 'Authorized. Token is valid via cookie.'})
    }
    else {
        response.status(403).send({ error: 'Unauthorized. Token is invalid.'})
        return
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token)
        return decodedToken
    } catch (error) {
        response.status(403).send({ error: 'Unauthorized. Token is invalid.'})
        return
    }
}

export default tokenValidation