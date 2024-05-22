import { onRequest } from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import express = require('express')

import {
    checkout_cart,
    get_current_cart,
    get_current_purchases,
    remove_user_purchase,
    add_to_cart,
    remove_from_cart,
    update_cart_quantity,
    get_products,
} from './controllers/ShoppingController'

import {
    getCurrentUser,
    createUser,
    deleteUser,
    updateUser,
} from './controllers/UserController'

export const USER_COLLECTION     = 'USER_COLLECTION'
export const SHOE_COLLECTION     = 'SHOE_COLLECTION'
export const CLOTHING_COLLECTION = 'CLOTHING_COLLECTION'

const app = express()
admin.initializeApp()

app.use(express.json())

/** *****************************

        User Endpoints

*******************************/

app.post  ('/create_user',           createUser            as any)
app.get   ('/get_current_user',      getCurrentUser        as any)
app.patch ('/update_user',           updateUser            as any)
app.delete('/delete_user',           deleteUser            as any)

/** *****************************

        Shopping Endpoints

*******************************/

app.post  ('/add_to_cart',           add_to_cart           as any)
app.get   ('/get_current_cart',      get_current_cart      as any)
app.patch ('/update_cart_quantity',  update_cart_quantity  as any)
app.delete('/remove_from_cart',      remove_from_cart      as any)
app.patch ('/checkout_cart',         checkout_cart         as any)

/** *****************************

        Purchase Endpoints

*******************************/

app.get   ('/get_current_purchases', get_current_purchases as any)
app.delete('/remove_user_purchase',  remove_user_purchase  as any)

/** *****************************

        Product Endpoints

*******************************/

app.get   ('/get_products',          get_products          as any)

exports.api = onRequest({ cors: true}, app)