/**
 * @file     ShoppingController.ts
 * @author   Zachary Wolfe (zw224021@ohio.edu)
 * @brief    A controller for the overall crud operations of the shopping cart and checkout.
 * @date     May 13, 2024
 * @version  1.0
 */

// BASIC CRUD OPERATIONS

import * as admin from 'firebase-admin'
import { SHOE_COLLECTION, USER_COLLECTION } from '..'
import { Request, Response } from 'express'
import { getToken } from './getToken'

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

/**********************************

    CHECKOUT CART ENDPOINTS

**********************************/

// CREATE
export const checkout_cart = async (request: Request, response: Response) => {
    const tokenAuthAndUID = await getToken(request, response)
    const items = request.body as Sku[]

    try {
        await admin
            .firestore()
            .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}/`)
            .update({
                purchases: admin.firestore.FieldValue.arrayUnion(items),
                numPurchases: admin.firestore.FieldValue.increment(1),
                totalSpent: admin.firestore.FieldValue.increment(
                    items.reduce((acc, item) => acc + item.price, 0),
                ),
            })
    } catch (error) {
        response.status(403).send({ error: 'Couldn\'t checkout.' })
    }
}

// READ
export const get_current_purchases = async (
    request: Request,
    response: Response,
) => {
    const tokenAuthAndUID = await getToken(request, response)

    try {
        const user = await admin
            .firestore()
            .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}/`)
            .get()

        const userData = user.data()
        response.status(200).send((userData as User).purchases)
    } catch (error) {
        response
            .status(403)
            .send({ error: 'User Not Found. Token is invalid.' })
    }
}

// DELETE
export const remove_user_purchase = async (
    request: Request,
    response: Response,
) => {
    const tokenAuthAndUID = await getToken(request, response)
    const data = request.body

    const productData = {
        id: data.id,
        name: data.name,
        image: data.image,
        size: data.size,
        price: data.price,
        colorway: data.colorway,
        skuStringID: data.skuStringID,
    }

    try {
        await admin
            .firestore()
            .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}/`)
            .update({
                purchases: admin.firestore.FieldValue.arrayRemove(productData),
                numPurchases: admin.firestore.FieldValue.increment(-1),
                totalSpent: admin.firestore.FieldValue.increment(
                    -productData.price,
                ),
            })
        response
            .status(200)
            .send({ message: 'Successfully removed from cart.' })
    } catch (error) {
        response.status(403).send({ error: 'Couldn\'t remove from cart.' })
    }
}

/**********************************

    SHOPPING CART ENDPOINTS

**********************************/

export const add_to_cart = async (request: Request, response: Response) => {
    const tokenAuthAndUID = await getToken(request, response)
    const data = request.body

    const productData = {
        id: data.id,
        name: data.name,
        image: data.image,
        size: data.size,
        price: data.price,
        colorway: data.colorway,
        skuStringID: data.skuStringID,
        gender: data.gender,
        brandName: data.brandName,
        laces: data.laces,
        condition: data.condition,
        bestSeller: data.bestSeller,
        manufacturer: data.manufacturer,
    }

    try {
        await admin
            .firestore()
            .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}/`)
            .update({
                cart: admin.firestore.FieldValue.arrayUnion(productData),
            })
        response.status(200).send({ message: 'Successfully added to cart.' })
    } catch (error) {
        response.status(403).send({ error: 'Couldn\'t add item to cart.' })
    }
}

export const get_current_cart = async (
    request: Request,
    response: Response,
) => {
    const tokenAuthAndUID = await getToken(request, response)

    try {
        const user = await admin
            .firestore()
            .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}/`)
            .get()
        const userData = user.data()
        response.status(200).send((userData as User).cart)
    } catch (error) {
        response
            .status(403)
            .send({ error: 'User Not Found. Token is invalid.' })
    }
}

export const update_cart_quantity = async (
    request: Request,
    response: Response,
) => {
    const tokenAuthAndUID = await getToken(request, response)
    const data = request.body
    // data.quantity
    const user = await admin
        .firestore()
        .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}/`)
        .get()

    const userData = user.data()
    const cart = (userData as User)?.cart

    if (!cart.has(data.sku)) {
        response.status(403).send({ error: 'Product not found in cart.' })
        return
    }

    cart.set(data.sku, cart.get(data.sku) + data.quantity)
    try {
        await admin
            .firestore()
            .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}/`)
            .update({ cart: admin.firestore.FieldValue.arrayUnion(data) })

        response.status(200).send({ message: 'Successfully updated cart.' })
    } catch (error) {
        response.status(403).send({ error: 'Couldn\'t update cart.' })
    }
}

export const remove_from_cart = async (
    request: Request,
    response: Response,
) => {
    const tokenAuthAndUID = await getToken(request, response)
    const data = request.body

    const productData = {
        id: data.id,
        name: data.name,
        image: data.image,
        size: data.size,
        price: data.price,
        colorway: data.colorway,
        skuStringID: data.skuStringID,
        gender: data.gender,
        brandName: data.brandName,
        laces: data.laces,
        condition: data.condition,
        bestSeller: data.bestSeller,
        manufacturer: data.manufacturer,
    }

    try {
        await admin
            .firestore()
            .doc(`${USER_COLLECTION}/${tokenAuthAndUID?.uid}/`)
            .update({
                cart: admin.firestore.FieldValue.arrayUnion(productData),
            })
        response.status(200).send({ message: 'Successfully added to cart.' })
    } catch (error) {
        response.status(403).send({ error: 'Couldn\'t add item to cart.' })
    }
}

export const get_products = async (request: Request, response: Response) => {
    try {
        const shoesList = await admin
            .firestore()
            .collection(SHOE_COLLECTION)
            .listDocuments()
        const shoePromises = await Promise.all(
            shoesList.map((shoe) => shoe.get()),
        )
        const shoes = shoePromises.map((shoe) => shoe.data())

        // const clothing = await admin
        // .firestore()
        // .collection(CLOTHING_COLLECTION)
        // .get()
        // reponse.status(200).send ({ clothing: clothing.docs })
        response.status(200).send({ shoes: shoes })
    } catch (error) {
        response.status(403).send({ error: 'Couldn\'t get products.' })
    }
}
