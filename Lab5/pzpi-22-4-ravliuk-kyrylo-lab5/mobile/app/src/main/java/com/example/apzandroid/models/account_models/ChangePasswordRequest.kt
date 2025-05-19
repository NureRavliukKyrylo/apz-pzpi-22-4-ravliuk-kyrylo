package com.example.apzandroid.models.account_models

data class ChangePasswordRequest (
    val last_password: String,
    val new_password: String
)