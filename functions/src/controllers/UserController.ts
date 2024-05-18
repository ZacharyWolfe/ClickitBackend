/**
 * @file     UserController.ts
 * @author   Zachary Wolfe (zw224021@ohio.edu)
 * @brief    A controller for the overall crud operations of the user.
 * @date     May 13, 2024
 * @version  1.0
*/

import * as admin from 'firebase-admin'
import { USER_COLLECTION } from '..'
import { Request, Response } from 'express'
import { getToken } from './getToken'

// BASIC CRUD OPERATIONS

export const get_current_user = async (
    request: Request, 
    response: Response
) => {
    const tokenAuthAndUID = await getToken(request, response)

    try {
        const user = await admin.firestore().doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}`).get()
        const userData = user.data()
        response.status(200).send(userData)
    } catch (error) {
        response.status(403).send({ error: 'User Not Found. Token is invalid.'})
    }
}

export const create_user = async (request: Request, response: Response) => {
    const tokenAuthAndUID = await getToken(request, response)

    const data = request.body

    const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${Math.random()}`)
        .then((response) => {
            const responseJson = response.json();
            return responseJson;
        })
            .then(async (data) => {
                const pokemon = data.results;
                return pokemon;
            })

    if (!pokemon.ok){
        response.status(403).send({ error: 'PokeAPI response not OK.'})
        return
    }
    
    const userInfo = {
        // CONTACT INFO
        firstName: data.firstName,
        middleInitial: data.middleInitial, 
        lastName: data.lastName,
        email: data.email,

        // USER INFO
        totalSpent: 0,
        numPurchases: 0,
        purchases: [],
    
        // MISC
        id: tokenAuthAndUID?.uid,
        userSince: new Date().toISOString(),
        onboarded: false,
        photoURL: pokemon.sprites.front_default ? pokemon.sprites.front_default : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    }

    try {
        await admin.firestore().doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}`).set(userInfo)
        response.status(200).send(userInfo)
    } catch (error) {
        response.status(403).send({ error: 'User Not Found. Token is invalid.'})
    }
}
export const delete_user = async (request: Request, response: Response) => {
    const tokenAuthAndUID = await getToken(request, response)

    try {
        await admin.firestore().doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}`).delete()
        response.status(200).send({ message: 'User Deleted.'})
    } catch (error) {
        response.status(403).send({ error: 'User Not Found. Token is invalid.'})
    }
}
export const update_user = async (request: Request, response: Response) => {
    const tokenAuthAndUID = await getToken(request, response)

    const data = request.body

    try {
        await admin.firestore().doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}`).update(data)
        response.status(200).send({ message: 'User Updated.'})
    } catch (error) {
        response.status(403).send({ error: 'User Not Found. Token is invalid.'})
    }
}