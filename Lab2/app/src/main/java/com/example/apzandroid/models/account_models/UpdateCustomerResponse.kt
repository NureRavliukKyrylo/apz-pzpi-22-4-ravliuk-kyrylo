package com.example.apzandroid.models.account_models

data class UpdateCustomerResponse (
    val id: String,
    val username: Int,
    val email: String,
    val role: Int,
    val date_joined: String
)