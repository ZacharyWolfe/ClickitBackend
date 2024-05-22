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

// What a SKU is
export interface Sku {
    id: string
    name: string
    image: string
    size: number
    price: number
    colorway: string
    skuStringID?: string
    gender: string
    brandName: string
    laces: boolean
    condition: boolean
    bestSeller: boolean
    manufacturer?: string
}

// What a user is
export type User = {
    // PERSONAL INFO
    firstName: string
    lastName: string

    // CONTACT INFO
    email: string
    password: string
    phone: string

    // ADDRESS INFO
    address: string
    city: string
    state: string
    country: string
    zipcode: string

    // OPTIONAL INFO
    age?: number
    gender?: string
    middleInitial?: string

    // USER INFO
    totalSpent: number
    numPurchases: number
    cart: Map<Sku, number>
    purchases: Map<Sku[], number[]>
    favorites: Sku[]

    // MISC
    id: string
    userSince: string
    onboarded: boolean
    photoURL: string
}

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
    
    const data = request.body as User

    console.log("request.body: ")
    console.log(data)
    
    const pokemonResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${Math.floor(Math.random() * 1025) + 1}`,
    )
    const pokemon = await pokemonResponse.json()

    console.log("pokemon: ")
    console.log(pokemon)

    if (!pokemon){
        console.log("pokemon not found")
        return
    }

    const userInfo = {
        firstName:      data.firstName              ? data.firstName    : "",
        lastName:       data.lastName               ? data.firstName    : "",
    
        // CONTACT INFO
        email:          data.email                  ? data.email        : "",
        password:       data.password               ? data.password     : "",
        phone:          data.phone                  ? data.phone        : "",
    
        // ADDRESS INFO
        address:        data.address                ? data.address      : "",
        city:           data.city                   ? data.city         : "",
        state:          data.state                  ? data.state        : "",
        country:        data.country                ? data.country      : "",
        zipcode:        data.zipcode                ? data.zipcode      : "",
    
        // OPTIONAL INFO
        age:            data.age                    ? data.age          : 0,
        gender:         data.gender                 ? data.gender       : "",
        middleInitial:  data.middleInitial          ? data.middleInitial: "",
    
        // USER INFO
        totalSpent:     data.totalSpent             ? data.totalSpent   : 0,
        numPurchases:   data.numPurchases           ? data.numPurchases : 0,
        cart:           data.cart                   ? data.cart         : Array.from(new Map<Sku, number>()),
        purchases:      data.purchases              ? data.purchases    : Array.from(new Map<Sku, number>()),  
        favorites:      data.favorites              ? data.favorites    : [],
    
        // MISC
        id:             tokenAuthAndUID?.uid        ? tokenAuthAndUID?.uid : "",   
        userSince:      new Date().toISOString(),
        onboarded:      data.onboarded              ? data.onboarded   : false,
        photoURL:       pokemon?.sprites.front_default
        ? pokemon.sprites.front_default
        : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    }
    
    // const userInfo = {
    //     // CONTACT INFO
    //     firstName: data.firstName ? data.firstName : "Zachary",
    //     lastName: data.lastName ? data.lastName : "Wolfe",

    //     middleInitial: data.middleInitial ? data.middleInitial : "a",
    //     email: "zacharywolfe29@gmail.com",

    //     // USER INFO
    //     totalSpent: 0,
    //     numPurchases: 0,
    //     purchases: [],

    //     // MISC
    //     id: tokenAuthAndUID?.uid,
    //     userSince: new Date().toISOString(),
    //     onboarded: false,
    //     photoURL: pokemon?.sprites.front_default
    //     ? pokemon.sprites.front_default
    //     : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
    // }

    console.log("userInfo: ")
    console.log(userInfo)
    
    try {        
        console.log("Creating User")
        await admin
            .firestore()
            .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}`)
            .set(userInfo)
        console.log("User Created")
        response
            .status(200)
            .send( userInfo)
    } catch (error) {
        response
            .status(403)
            .send({ error: 'User Not Found. Token is invalid.' })
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
