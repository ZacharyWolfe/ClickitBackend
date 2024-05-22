/**
 * @file     index.ts
 * @author   Zachary Wolfe (zw224021@ohio.edu)
 * @brief    A file to reduce code repetition in the controllers and provide basic token validation.
 * @date     May 14, 2024
 * @version  1.0
 */

import tokenValidation from '../middleware'
import { Request, Response } from 'express'

export const getToken = async (request: Request, response: Response) => {
    const userToken = await tokenValidation(request, response)
    const uid = userToken?.uid

    if (!userToken || !uid) {
        response.status(403).send({ error: 'Invalid Token or UID. Cannot Create User' })
        return
    }

    return userToken
}
