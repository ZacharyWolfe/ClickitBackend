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

export const getCurrentUser = async (
    request: Request,
    response: Response,
) => {
    console.log('get_current_user')
    const tokenAuthAndUID = await getToken(request, response)
    console.log("token: ")
    console.log(tokenAuthAndUID)

    try {
        const user = await admin
            .firestore()
            .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}`)
            .get()
        const userData = user.data()
        console.log("userData: ")
        console.log(userData)
        response.status(200).send(userData)
    } catch (error) {
        console.log('error: ')
        console.log(error)
    }
}

export const createUser = async (request: Request, response: Response) => {
    const tokenAuthAndUID = await getToken(request, response)
    console.log("token: ")
    console.log(tokenAuthAndUID)
    // const data = request.body

    const pokemonResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${Math.floor(Math.random() * 1118) + 1}`,
    )
    const pokemon = await pokemonResponse.json()

    console.log("pokemon: ")
    console.log(pokemon)

    if (!pokemon){
        console.log("pokemon not found")
        return
    }

    const userInfo = {
        // CONTACT INFO
        firstName: "billy",
        middleInitial: "a",
        lastName: "wolfe",
        email: "zacharywolfe29@gmail.com",

        // USER INFO
        totalSpent: 0,
        numPurchases: 0,
        purchases: [],

        // MISC
        id: tokenAuthAndUID?.uid,
        userSince: new Date().toISOString(),
        onboarded: false,
        photoURL: pokemon?.sprites.front_default
        ? pokemon.sprites.front_default
        : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    }
    
    console.log(userInfo)
    
    try {        
        await admin
            .firestore()
            .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}`)
            .set(userInfo)
        console.log("User Created")
        response
            .status(200)
            .send( userInfo)

    } catch (error) {
        // response
        //     .status(403)
        //     .send({ error: 'User Not Found. Token is invalid.' })
    }
}
export const deleteUser = async (request: Request, response: Response) => {
    const tokenAuthAndUID = await getToken(request, response)

    try {
        await admin
            .firestore()
            .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}`)
            .delete()
        response.status(200).send({ message: 'User Deleted.' })
    } catch (error) {
        response
            .status(403)
            .send({ error: 'User Not Found. Token is invalid.' })
        return
    }
}
export const updateUser = async (request: Request, response: Response) => {
    const tokenAuthAndUID = await getToken(request, response)

    const data = request.body

    try {
        await admin
            .firestore()
            .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}`)
            .update(data)
        response.status(200).send({ message: 'User Updated.' })
    } catch (error) {
        response
            .status(403)
            .send({ error: 'User Not Found. Token is invalid.' })
        return
    }
}
